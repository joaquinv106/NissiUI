"use client"

import { Box, Button, Center, Flex, Spinner, Stack, Steps, Text } from "@chakra-ui/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { resolveNStepFlowLabels } from "./labels"
import type {
  NStepFlowActionContext,
  NStepFlowNavigationReason,
  NStepFlowProps,
  NStepFlowStateUpdater,
} from "./types"
import { findStepIndex, resolveStepState, stepTitleText } from "./utils"

/** Orquesta borradores tipados a través de pasos validables sin asumir un dominio. */
export function NStepFlow<TState>({
  steps,
  state,
  defaultState,
  onStateChange,
  stepId,
  defaultStepId,
  onStepChange,
  onComplete,
  linear = true,
  allowStepSelection = true,
  orientation = "horizontal",
  validateOnBack = false,
  renderActions,
  header,
  footer,
  loading = false,
  error,
  emptyState,
  disabled = false,
  colorPalette = "blue",
  labels: labelsProp,
}: NStepFlowProps<TState>) {
  const labels = useMemo(() => resolveNStepFlowLabels(labelsProp), [labelsProp])
  const [internalState, setInternalState] = useState(defaultState)
  const [internalStepId, setInternalStepId] = useState(defaultStepId ?? steps[0]?.id ?? "")
  const [validationMessage, setValidationMessage] = useState<string>()
  const [busy, setBusy] = useState(false)
  const stateRef = useRef(state ?? internalState)
  const warnedAboutDuplicateIds = useRef(false)
  const activeState = state ?? internalState
  stateRef.current = activeState
  const activeStepId = stepId ?? internalStepId
  const activeIndex = findStepIndex(steps, activeStepId)
  const activeStep = steps[activeIndex]

  useEffect(() => {
    const ids = steps.map((step) => step.id)
    const isDevelopment = typeof process === "undefined" || process.env.NODE_ENV !== "production"
    if (isDevelopment && !warnedAboutDuplicateIds.current && new Set(ids).size !== ids.length) {
      warnedAboutDuplicateIds.current = true
      console.warn("[NissiUI] NStepFlow recibió identificadores de paso duplicados.")
    }
  }, [steps])

  const publishState = (updater: NStepFlowStateUpdater<TState>) => {
    if (!activeStep) return
    const nextState = resolveStepState(stateRef.current, updater)
    stateRef.current = nextState
    if (state === undefined) setInternalState(nextState)
    onStateChange?.(nextState, { reason: "step", stepId: activeStep.id })
  }

  const validateStep = async (index: number): Promise<boolean> => {
    const candidate = steps[index]
    if (!candidate || candidate.skippable || !candidate.validate) {
      setValidationMessage(undefined)
      return true
    }
    try {
      const message = await candidate.validate(stateRef.current, { stepId: candidate.id, index })
      setValidationMessage(message)
      return !message
    } catch {
      setValidationMessage(labels.validationError)
      return false
    }
  }

  const publishStep = (targetIndex: number, reason: NStepFlowNavigationReason) => {
    const target = steps[targetIndex]
    if (!activeStep || !target) return
    if (stepId === undefined) setInternalStepId(target.id)
    setValidationMessage(undefined)
    onStepChange?.(target.id, {
      reason,
      previousStepId: activeStep.id,
      stepId: target.id,
      previousIndex: activeIndex,
      index: targetIndex,
      state: stateRef.current,
    })
  }

  const requestStep = async (targetIndex: number, reason: NStepFlowNavigationReason): Promise<boolean> => {
    const target = steps[targetIndex]
    if (!activeStep || !target || target.disabled || disabled || busy || targetIndex === activeIndex) return false
    if (linear && targetIndex > activeIndex) {
      const enabledBetween = steps.slice(activeIndex + 1, targetIndex).some((step) => !step.disabled)
      if (enabledBetween) return false
    }
    const mustValidate = targetIndex > activeIndex || validateOnBack
    setBusy(mustValidate)
    const valid = !mustValidate || await validateStep(activeIndex)
    setBusy(false)
    if (!valid) return false
    publishStep(targetIndex, reason)
    return true
  }

  const adjacentIndex = (direction: 1 | -1) => {
    let candidate = activeIndex + direction
    while (candidate >= 0 && candidate < steps.length && steps[candidate]?.disabled) candidate += direction
    return candidate
  }

  const goNext = () => requestStep(adjacentIndex(1), "next")
  const goBack = () => requestStep(adjacentIndex(-1), "previous")
  const goTo = (targetStepId: string) => {
    const targetIndex = steps.findIndex((step) => step.id === targetStepId)
    return targetIndex < 0 ? Promise.resolve(false) : requestStep(targetIndex, "select")
  }
  const previousIndex = adjacentIndex(-1)
  const nextIndex = adjacentIndex(1)
  const isFirstStep = previousIndex < 0
  const isLastStep = nextIndex >= steps.length

  const complete = async (): Promise<boolean> => {
    if (!activeStep || disabled || busy) return false
    setBusy(true)
    const valid = await validateStep(activeIndex)
    if (!valid) {
      setBusy(false)
      return false
    }
    try {
      const result = await onComplete?.(stateRef.current)
      setBusy(false)
      return result !== false
    } catch {
      setValidationMessage(labels.validationError)
      setBusy(false)
      return false
    }
  }

  if (error) {
    return (
      <Stack as="section" aria-label={labels.flowLabel} role="alert" gap="1" p="4" borderWidth="1px" borderColor="border.error" rounded="lg" bg="bg.error">
        <Text color="fg.error" fontWeight="semibold">{labels.errorTitle}</Text>
        <Box color="fg.error">{error}</Box>
      </Stack>
    )
  }

  if (loading) {
    return (
      <Center as="section" aria-label={labels.flowLabel} role="status" minH="12rem" gap="3" color="fg.muted">
        <Spinner size="sm" />
        <Text>{labels.loading}</Text>
      </Center>
    )
  }

  if (!activeStep) {
    return emptyState ?? (
      <Center as="section" aria-label={labels.flowLabel} role="status" minH="12rem" flexDirection="column" gap="2" p="6" textAlign="center" borderWidth="1px" borderColor="border" rounded="lg" bg="bg.panel">
        <Text fontWeight="semibold">{labels.emptyTitle}</Text>
        <Text color="fg.muted" fontSize="sm">{labels.emptyDescription}</Text>
      </Center>
    )
  }

  const context: NStepFlowActionContext<TState> = {
    state: activeState,
    setState: publishState,
    stepId: activeStep.id,
    index: activeIndex,
    count: steps.length,
    first: isFirstStep,
    last: isLastStep,
    busy,
    disabled,
    goNext,
    goBack,
    goTo,
    validationMessage,
  }

  const actions = renderActions?.(context) ?? (
    <Flex justify="space-between" align="center" gap="3" direction={{ base: "column-reverse", sm: "row" }}>
      <Button type="button" variant="ghost" width={{ base: "full", sm: "auto" }} disabled={disabled || busy || isFirstStep} onClick={() => void goBack()}>
        <ChevronLeft aria-hidden size={16} />
        {labels.previous}
      </Button>
      <Button
        type="button"
        colorPalette={colorPalette}
        width={{ base: "full", sm: "auto" }}
        disabled={disabled}
        loading={busy}
        loadingText={labels.working}
        onClick={() => void (isLastStep ? complete() : goNext())}
      >
        {isLastStep ? labels.complete : labels.next}
        {!isLastStep ? <ChevronRight aria-hidden size={16} /> : null}
      </Button>
    </Flex>
  )

  return (
    <Stack as="section" aria-label={labels.flowLabel} gap="5" minW="0" colorPalette={colorPalette}>
      {header}
      <Steps.Root
        count={steps.length}
        step={activeIndex}
        linear={linear}
        orientation={orientation}
        width="full"
        minW="0"
        onStepChange={({ step }) => { void requestStep(step, "select") }}
      >
        <Box
          width="full"
          maxW="full"
          minW="0"
          contain={orientation === "horizontal" ? "inline-size" : undefined}
          overflowX={orientation === "horizontal" ? "auto" : undefined}
          pb={orientation === "horizontal" ? "2" : undefined}
        >
          <Steps.List aria-label={labels.stepsLabel} minW={orientation === "horizontal" ? "max-content" : undefined}>
            {steps.map((step, index) => {
              const titleText = stepTitleText(step.title, String(index + 1))
              const selectionBlocked = !allowStepSelection || step.disabled || disabled || (linear && index > activeIndex + 1)
              return (
                <Steps.Item key={step.id} index={index} flex={orientation === "horizontal" ? "1" : undefined} minW={orientation === "horizontal" ? "10rem" : undefined}>
                  <Steps.Trigger
                    aria-label={labels.stepAriaLabel(titleText, index + 1, steps.length)}
                    disabled={selectionBlocked}
                    tabIndex={selectionBlocked ? -1 : 0}
                    onClick={linear ? () => { void goTo(step.id) } : undefined}
                  >
                    <Steps.Indicator />
                    <Stack gap="0" textAlign="start">
                      <Steps.Title>{step.title}</Steps.Title>
                      {step.description ? <Steps.Description>{step.description}</Steps.Description> : null}
                      {step.optional ? <Text color="fg.muted" fontSize="xs">{labels.optional}</Text> : null}
                    </Stack>
                  </Steps.Trigger>
                  {index < steps.length - 1 ? <Steps.Separator /> : null}
                </Steps.Item>
              )
            })}
          </Steps.List>
        </Box>

        <Steps.Content key={activeStep.id} index={activeIndex} width="full" minW="0" p={{ base: "4", md: "6" }} borderWidth="1px" borderColor="border" rounded="lg" bg="bg.panel">
          {activeStep.render(context)}
        </Steps.Content>
      </Steps.Root>

      {validationMessage ? (
        <Box role="alert" p="3" borderWidth="1px" borderColor="border.error" rounded="md" bg="bg.error" color="fg.error" fontSize="sm">
          {validationMessage}
        </Box>
      ) : null}
      {actions}
      {footer}
    </Stack>
  )
}
