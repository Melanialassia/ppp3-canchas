import { CardPage } from './CardPage'

export function ForbiddenPage() {
  return (
    <CardPage
      code={403}
      src="/red-card.png"
      title="¡Roja directa!"
      description="No tenés permiso para entrar a esta sección."
      accentClassName="text-red-400"
    />
  )
}
