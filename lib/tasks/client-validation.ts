type DeadlineLike = {
  year: number | null
  month: number | null
  day: number | null
  time: string
}

export type FieldIssue = {
  key: string
  message: string
}

type Input = {
  opener: string
  deadline: DeadlineLike
  needToDo: string
  otherDescription: string
  showNeedToDo: boolean
}

export function collectSubmitIssues(input: Input): FieldIssue[] {
  const issues: FieldIssue[] = []
  const hasDate = Boolean(input.deadline.year && input.deadline.month && input.deadline.day)
  const hasTime = Boolean(input.deadline.time)

  if (!input.opener) {
    issues.push({ key: "opener", message: "בחרו מי פותח את המשימה." })
  }
  if (!hasDate) {
    issues.push({
      key: "deadlineDate",
      message: "בחרו תאריך ביומן, או כתבו בשפה חופשית ואז הבן תאריך.",
    })
  }
  if (!hasTime) {
    issues.push({
      key: "deadlineTime",
      message: "בחרו שעה. בלי שעה אי אפשר לפתוח משימה.",
    })
  }
  if (input.showNeedToDo && !input.needToDo.trim()) {
    issues.push({
      key: "needToDo",
      message: "כתבו מה צריך לעשות בתכלס. זה השדה החופשי, כמו בוואטסאפ.",
    })
  }
  if (!input.showNeedToDo && !input.otherDescription.trim()) {
    issues.push({
      key: "otherDescription",
      message: "כתבו את תיאור המשימה.",
    })
  }

  return issues
}

export function issueMap(issues: FieldIssue[]): Record<string, string> {
  return Object.fromEntries(issues.map((item) => [item.key, item.message]))
}
