'use client';

/**
 * Demos interativas para /_design (só em dev). Texto de ferramenta interna,
 * fora de messages/ de propósito: esta página nunca vai para produção.
 */
import { useState } from 'react';

import { CheckIcon, ChevronDownIcon, CopyIcon, ICONS, MoonIcon, SunIcon } from '@/components/icons';
import { Button, ButtonIcon } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function ButtonsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Primário</Button>
      <Button variant="secondary">
        <ButtonIcon>
          <ICONS.play size={14} />
        </ButtonIcon>
        Secundário
      </Button>
      <Button variant="brand">Marca</Button>
      <Button variant="ghost">Ghost</Button>
      <Button disabled>Desativado</Button>
      <Button variant="secondary" size="icon" aria-label="Buscar">
        <ICONS.search size={18} />
      </Button>
      <Button size="sm" variant="secondary">
        Pequeno
      </Button>
      <Button size="lg">Grande</Button>
    </div>
  );
}

export function InputsDemo() {
  return (
    <div className="grid max-w-md gap-3">
      <label className="grid gap-1.5 text-small text-secondary">
        Nome
        <Input placeholder="Nome oficial do recurso" />
      </label>
      <label className="grid gap-1.5 text-small text-secondary">
        Busca (pílula)
        <Input shape="pill" type="search" placeholder="Buscar no índice" />
      </label>
      <label className="grid gap-1.5 text-small text-secondary">
        Inválido
        <Input aria-invalid defaultValue="http://sem-https.dev" />
      </label>
    </div>
  );
}

export function OverlaysDemo() {
  const [sort, setSort] = useState('recent');
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary">Abrir diálogo</Button>
        </DialogTrigger>
        <DialogContent closeLabel="Fechar">
          <DialogHeader>
            <DialogTitle>Título do diálogo</DialogTitle>
            <DialogDescription>Recipe 06 · Modal do transitions.dev, sem blur.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">
            Ordenar
            <ChevronDownIcon size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenuRadioItem value="recent">Mais recentes</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="name">Nome</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Copiar link
            <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>Desativado</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Copiar link">
            <ICONS.link size={18} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copiar link</TooltipContent>
      </Tooltip>
    </div>
  );
}

export function TabsDemo() {
  return (
    <Tabs defaultValue="all">
      <TabsList aria-label="Preço">
        <TabsTrigger value="all">Todos</TabsTrigger>
        <TabsTrigger value="free">Grátis</TabsTrigger>
        <TabsTrigger value="freemium">Freemium</TabsTrigger>
        <TabsTrigger value="paid">Pago</TabsTrigger>
      </TabsList>
      <TabsContent value="all" className="text-small text-secondary">
        Todos os preços.
      </TabsContent>
      <TabsContent value="free" className="text-small text-secondary">
        Só grátis.
      </TabsContent>
      <TabsContent value="freemium" className="text-small text-secondary">
        Só freemium.
      </TabsContent>
      <TabsContent value="paid" className="text-small text-secondary">
        Só pagos.
      </TabsContent>
    </Tabs>
  );
}

export function IconsDemo() {
  const [dark, setDark] = useState(true);
  const [copied, setCopied] = useState(false);
  return (
    <div className="grid gap-4">
      <ul className="flex flex-wrap gap-2">
        {Object.entries(ICONS).map(([name, Icon]) => (
          <li key={name}>
            <button
              type="button"
              aria-label={name}
              className="t-hover t-icon-host flex w-24 flex-col items-center gap-2 rounded-panel border border-border bg-carbon px-2 py-3 text-secondary hover:text-primary"
            >
              <Icon size={22} />
              <span className="font-mono text-mono text-muted">{name}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => setDark((value) => !value)} aria-label="Trocar ícone de tema">
          <span className="t-icon-swap" data-state={dark ? 'a' : 'b'}>
            <span className="t-icon" data-icon="a">
              <MoonIcon size={18} motion="none" />
            </span>
            <span className="t-icon" data-icon="b">
              <SunIcon size={18} motion="none" />
            </span>
          </span>
          Icon swap
        </Button>
        <Button variant="secondary" onClick={() => setCopied((value) => !value)}>
          <span className="t-icon-swap" data-state={copied ? 'b' : 'a'}>
            <span className="t-icon" data-icon="a">
              <CopyIcon size={18} motion="none" />
            </span>
            <span className="t-icon" data-icon="b">
              <CheckIcon size={18} motion="none" />
            </span>
          </span>
          {copied ? 'Copiado' : 'Copiar'}
        </Button>
      </div>
    </div>
  );
}
