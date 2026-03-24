require("dotenv").config();
const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// URL에 나오는 것은 DB ID입니다. dataSources.query에는 DB 안의 data_sources[].id가 필요해 retrieve로 조회합니다.
const DATABASE_ID = process.env.NOTION_DATABASE_ID || process.env.NOTION_DATA_SOURCE_ID;
const PERSON_PROP = process.env.NOTION_PERSON_PROPERTY || "Person";
const DUE_PROP = process.env.NOTION_DUE_DATE_PROPERTY || "Due Date";
const STATUS_PROP = process.env.NOTION_STATUS_PROPERTY || "Status";
const TITLE_PROP = process.env.NOTION_TITLE_PROPERTY || "Name";

const SKIP_IF_STATUS = new Set(["done", "archive"]);

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfDay(dateLike) {
  const d = new Date(dateLike);
  d.setHours(0, 0, 0, 0);
  return d;
}

function diffInDaysFromToday(dateLike) {
  const today = startOfToday();
  const due = startOfDay(dateLike);
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

function getTitle(page) {
  const prop = page.properties[TITLE_PROP];
  if (!prop || prop.type !== "title" || !prop.title.length) return "(untitled)";
  return prop.title.map(t => t.plain_text).join("");
}

function getStatus(page) {
  const prop = page.properties[STATUS_PROP];
  if (!prop) return null;
  if (prop.type === "status") return prop.status?.name ?? null;
  if (prop.type === "select") return prop.select?.name ?? null;
  return null;
}

function getDueDate(page) {
  const prop = page.properties[DUE_PROP];
  if (!prop || prop.type !== "date") return null;
  return prop.date?.start ?? null;
}

function getPeople(page) {
  const prop = page.properties[PERSON_PROP];
  if (!prop || prop.type !== "people") return [];
  return prop.people ?? [];
}

function buildMessage(diff, title) {
  if (diff === 3) return `⏰ 마감일이 3일 남았습니다. [작업: ${title}]`;
  if (diff === 1) return `🔥 마감일이 하루 남았습니다. [작업: ${title}]`;
  if (diff < 0) {
    const overdueDays = Math.abs(diff);
    if (overdueDays >= 7) return `🚨 마감일이 ${overdueDays}일 지났습니다. 완료 여부를 확인해주세요. [작업: ${title}]`;
    if (overdueDays >= 3) return `⚠️ 마감일이 ${overdueDays}일 지났습니다. [작업: ${title}]`;
    return `⚠️ 마감일이 지났습니다. [작업: ${title}]`;
  }
  return null;
}

function buildMentionRichText(users, message) {
  const richText = [];

  if (users.length > 0) {
    users.forEach((user, idx) => {
      richText.push({
        type: "mention",
        mention: {
          user: { id: user.id },
        },
      });

      if (idx < users.length - 1) {
        richText.push({
          type: "text",
          text: { content: " " },
        });
      }
    });

    richText.push({
      type: "text",
      text: { content: " " + message },
    });
  } else {
    richText.push({
      type: "text",
      text: { content: message },
    });
  }

  return richText;
}

async function getDataSourceId() {
  if (!DATABASE_ID) {
    throw new Error("Set NOTION_DATABASE_ID (or legacy NOTION_DATA_SOURCE_ID) to your database ID from the Notion URL.");
  }
  const db = await notion.databases.retrieve({ database_id: DATABASE_ID });
  const first = db.data_sources?.[0];
  if (!first?.id) {
    throw new Error("Could not resolve data source: database has no data_sources.");
  }
  return first.id;
}

async function run() {
  const dataSourceId = await getDataSourceId();
  let cursor = undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const page of response.results) {
      const title = getTitle(page);
      const status = getStatus(page);
      const dueDate = getDueDate(page);
      const people = getPeople(page);

      if (!dueDate) continue;
      if (status && SKIP_IF_STATUS.has(status.toLowerCase())) continue;

      const diff = diffInDaysFromToday(dueDate);
      const message = buildMessage(diff, title);
      if (!message) continue;

      const richText = buildMentionRichText(people, message);

      await notion.comments.create({
        parent: { page_id: page.id },
        rich_text: richText,
      });

      console.log(`comment added: ${title}`);
    }

    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});