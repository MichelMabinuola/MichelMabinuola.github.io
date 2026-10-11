import { Bot, Briefcase, Database, FileText, Mail, PenLine, RadioTower, Search, User, type LucideProps } from 'lucide-react'

const ICONS = {
  user: User,
  briefcase: Briefcase,
  bot: Bot,
  database: Database,
  search: Search,
  'radio-tower': RadioTower,
  mail: Mail,
  pen: PenLine,
}

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const C = ICONS[name as keyof typeof ICONS] ?? FileText
  return <C aria-hidden="true" strokeWidth={1.75} {...props} />
}
