import type { TaskTypeConfig, TaskTypeId } from "@/lib/tasks/types"

export const TASK_TYPES: TaskTypeConfig[] = [
  {
    id: "meta_monday_new",
    label: "חיבור חדש לטופס ממטא למאנדיי",
    shortLabel: "חיבור טופס ממטא למאנדיי",
    showNeedToDo: true,
    fields: [
      { key: "clientName", label: "שם הלקוח", kind: "text", required: true },
      { key: "businessName", label: "שם העסק", kind: "text" },
      { key: "clientPhone", label: "טלפון הלקוח", kind: "tel", inputMode: "tel" },
      {
        key: "pageId",
        label: "Page ID",
        kind: "text",
        required: true,
        inputMode: "numeric",
        help: "מזהה עמוד הפייסבוק, 15 ספרות ומעלה.",
      },
      {
        key: "formId",
        label: "Form ID",
        kind: "text",
        inputMode: "numeric",
        help: "ב-Meta Business Suite, תחת Instant Forms, נכנסים לטופס והמזהה מופיע בכתובת. אם הקמפיין עוד לא פורסם, אפשר להשאיר ריק ולציין זאת למטה.",
      },
      {
        key: "formName",
        label: "שם הטופס",
        kind: "text",
        help: "העתק הדבק מדויק ממטא.",
      },
      {
        key: "mondayBoardId",
        label: "מזהה בורד מאנדיי",
        kind: "text",
        required: true,
        inputMode: "numeric",
      },
      {
        key: "sharedBoard",
        label: "שיתפתי את איתן בבורד במאנדיי",
        kind: "checkbox",
        required: true,
      },
    ],
  },
  {
    id: "meta_add_form",
    label: "הוספת טופס לאוטומציה קיימת",
    shortLabel: "הוספת טופס לאוטומציה קיימת",
    showNeedToDo: true,
    fields: [
      { key: "clientName", label: "שם הלקוח", kind: "text", required: true },
      { key: "businessName", label: "שם העסק", kind: "text" },
      {
        key: "formId",
        label: "Form ID",
        kind: "text",
        required: true,
        inputMode: "numeric",
        help: "מזהה הטופס, לא השם.",
      },
      {
        key: "formName",
        label: "שם הטופס",
        kind: "text",
        required: true,
        help: "העתק הדבק מדויק ממטא.",
      },
    ],
  },
  {
    id: "site_monday",
    label: "חיבור אתר למאנדיי",
    shortLabel: "חיבור אתר למאנדיי",
    showNeedToDo: true,
    fields: [
      { key: "clientName", label: "שם הלקוח", kind: "text", required: true },
      {
        key: "mondayBoardId",
        label: "מזהה בורד מאנדיי",
        kind: "text",
        required: true,
        inputMode: "numeric",
      },
      {
        key: "sharedBoard",
        label: "שיתפתי את איתן בבורד במאנדיי",
        kind: "checkbox",
        required: true,
      },
      {
        key: "siteBuilder",
        label: "שם בונה האתר",
        kind: "text",
        required: true,
      },
      {
        key: "siteUrl",
        label: "כתובת האתר או הדף",
        kind: "url",
        inputMode: "url",
      },
    ],
  },
  {
    id: "whatsapp",
    label: "אוטומציית וואטסאפ",
    shortLabel: "אוטומציית וואטסאפ",
    showNeedToDo: true,
    fields: [
      { key: "clientName", label: "שם הלקוח", kind: "text", required: true },
      {
        key: "messageBody",
        label: "נוסח ההודעה שצריכה להישלח",
        kind: "textarea",
        required: true,
        help: "אפשר להעתיק בדיוק כמו שההודעה צריכה להיראות. מה שבין כוכביות יופיע מודגש.",
      },
      {
        key: "fromNumber",
        label: "מאיזה מספר נשלח",
        kind: "tel",
        required: true,
        inputMode: "tel",
      },
      {
        key: "fromForm",
        label: "מאיזה טופס זה יוצא",
        kind: "text",
        help: "אם רלוונטי. בלי זה ההודעה עלולה לצאת לכל ליד של הלקוח.",
      },
    ],
  },
  {
    id: "fix_automation",
    label: "תיקון אוטומציה קיימת",
    shortLabel: "תיקון אוטומציה קיימת",
    showNeedToDo: true,
    fields: [
      { key: "clientName", label: "שם הלקוח", kind: "text", required: true },
      {
        key: "expectedBehavior",
        label: "מה צריך שיקרה",
        kind: "textarea",
        required: true,
      },
      {
        key: "verifiedBroken",
        label: "בדקתי ווידאתי שזה בוודאות לא עובד",
        kind: "checkbox",
        required: true,
      },
    ],
  },
  {
    id: "email",
    label: "אוטומציות מיילים",
    shortLabel: "אוטומציות מיילים",
    showNeedToDo: true,
    fields: [
      { key: "clientName", label: "שם הלקוח", kind: "text", required: true },
      { key: "mailTo", label: "למי נשלח המייל", kind: "text", required: true },
      {
        key: "mailFrom",
        label: "כתובת המייל שממנה נשלח",
        kind: "email",
        required: true,
        inputMode: "email",
        help: "את הסיסמה או ההרשאה איתן יבקש ממך ישירות, לא דרך הטופס.",
      },
      {
        key: "mailBody",
        label: "נוסח המייל",
        kind: "textarea",
        required: true,
      },
    ],
  },
  {
    id: "other",
    label: "אחר",
    shortLabel: "אחר",
    showNeedToDo: false,
    fields: [
      {
        key: "otherDescription",
        label: "תיאור המשימה",
        kind: "textarea",
        required: true,
      },
      {
        key: "clientName",
        label: "שם הלקוח",
        kind: "text",
        help: "אם רלוונטי.",
      },
    ],
  },
]

export const DEFAULT_CAMPAIGNERS = [
  "סתיו יהוד",
  "אוריה",
  "סתיו מויאל",
  "ליה",
  "מיה ילין",
  "אוראל עמיחי",
  "אורן",
  "אילונה",
  "אלי",
  "מיתר ששון",
  "פלג",
]

export function taskTypeById(id: TaskTypeId): TaskTypeConfig {
  const found = TASK_TYPES.find((item) => item.id === id)
  if (!found) {
    throw new Error("סוג משימה לא מוכר")
  }
  return found
}
