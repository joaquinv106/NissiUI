"use client"

import { Box, Button, Field, Flex, IconButton, Input, Stack, Text } from "@chakra-ui/react"
import { File, Upload, X } from "lucide-react"
import { useId, useMemo, useState } from "react"

import { defaultNFileUploadLabels, resolveLabels } from "./labels"
import type { NFileUploadProps } from "./types"

function matchesAccept(file: File, accept?: string) {
  if (!accept) return true
  return accept.split(",").map((value) => value.trim().toLowerCase()).some((rule) => {
    if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule)
    if (rule.endsWith("/*")) return file.type.toLowerCase().startsWith(rule.slice(0, -1))
    return file.type.toLowerCase() === rule
  })
}

export function NFileUpload({ files, defaultFiles = [], onFilesChange, onRejected, accept, multiple = true, maxFiles = Number.POSITIVE_INFINITY, maxSize = Number.POSITIVE_INFINITY, disabled, labels: custom, unstyled = false, classNames, styles }: NFileUploadProps) {
  const labels = useMemo(() => resolveLabels(defaultNFileUploadLabels, custom), [custom])
  const [internal, setInternal] = useState(defaultFiles)
  const [rejected, setRejected] = useState(false)
  const inputId = useId()
  const current = files ?? internal
  const update = (next: File[]) => { if (files === undefined) setInternal(next); onFilesChange?.(next) }
  const add = (incoming: File[]) => {
    const unique = incoming.filter((file) => !current.some((item) => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified))
    const eligible = unique.filter((file) => file.size <= maxSize && matchesAccept(file, accept))
    const baseFiles = multiple ? current : []
    const capacity = multiple ? Math.max(0, maxFiles - baseFiles.length) : 1
    const acceptedFiles = eligible.slice(0, capacity)
    const next = [...baseFiles, ...acceptedFiles]
    const rejectedFiles = unique.filter((file) => !eligible.includes(file))
    rejectedFiles.push(...eligible.slice(capacity))
    setRejected(rejectedFiles.length > 0)
    if (rejectedFiles.length) onRejected?.(rejectedFiles)
    update(next)
  }
  return (
    <Field.Root invalid={rejected} disabled={disabled} className={classNames?.root} css={styles?.root} data-scope="n-file-upload" data-part="root">
      <Field.Label unstyled={unstyled} className={classNames?.label} css={styles?.label} data-part="label">{labels.label}</Field.Label>
      <Box borderWidth={unstyled ? undefined : "2px"} borderStyle={unstyled ? undefined : "dashed"} borderColor="border" rounded={unstyled ? undefined : "lg"} p={unstyled ? undefined : { base: "5", md: "7" }} textAlign="center" bg={unstyled ? undefined : "bg.subtle"} _hover={unstyled ? undefined : { borderColor: "colorPalette.muted" }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (!disabled) add(Array.from(event.dataTransfer.files)) }} className={classNames?.dropzone} css={styles?.dropzone} data-part="dropzone">
        <Stack align="center" gap="2"><Upload aria-hidden="true" /><Text color="fg.muted">{labels.description}</Text><Button asChild size="sm" variant="outline" disabled={disabled}><label htmlFor={inputId}>{labels.browse}</label></Button></Stack>
        <Input id={inputId} type="file" accept={accept} multiple={multiple} hidden disabled={disabled} onChange={(event) => { add(Array.from(event.target.files ?? [])); event.target.value = "" }} />
      </Box>
      {rejected ? <Field.ErrorText role="alert" className={classNames?.error} css={styles?.error} data-part="error">{labels.rejected}</Field.ErrorText> : null}
      {current.length ? <Stack gap="2" width="full" className={classNames?.fileList} css={styles?.fileList} data-part="file-list">{current.map((file, index) => <Flex key={`${file.name}-${file.lastModified}-${index}`} align="center" gap="3" p={unstyled ? undefined : "2"} borderWidth={unstyled ? undefined : "1px"} borderColor="border" rounded={unstyled ? undefined : "md"} className={classNames?.file} css={styles?.file} data-part="file"><File size={17} aria-hidden="true" /><Box minW="0" flex="1"><Text truncate fontWeight="medium">{file.name}</Text><Text textStyle="xs" color="fg.muted">{Math.ceil(file.size / 1024)} KB</Text></Box><IconButton size="xs" variant="ghost" aria-label={labels.remove(file.name)} onClick={() => update(current.filter((_, itemIndex) => itemIndex !== index))}><X size={15} /></IconButton></Flex>)}</Stack> : null}
    </Field.Root>
  )
}
