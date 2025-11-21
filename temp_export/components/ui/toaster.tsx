'use client'

import * as React from 'react'
import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts
        .filter(({ title, description, action }) => {
          // Filtrar toasts vacíos antes de renderizar
          const hasTitle = title && String(title).trim().length > 0
          const hasDescription = description && String(description).trim().length > 0
          return hasTitle || hasDescription || action
        })
        .map(function ({ id, title, description, action, ...props }) {
          const hasTitle = title && String(title).trim().length > 0
          const hasDescription = description && String(description).trim().length > 0
          
          return (
            <Toast key={id} {...props}>
              <div className="grid gap-1">
                {hasTitle && <ToastTitle>{title}</ToastTitle>}
                {hasDescription && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {action}
              <ToastClose />
            </Toast>
          )
        })}
      <ToastViewport />
    </ToastProvider>
  )
}
