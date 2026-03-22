import type { WSEvent } from '../../types'
import { beforeEach, describe, expect, it } from 'vitest'
import { useMessageStore } from './messageStore'

describe('useMessageStore round dividers', () => {
  beforeEach(() => {
    useMessageStore.getState().reset()
  })

  it('maps zero-based round_start values to visible Round numbers and ignores restart banners', () => {
    const store = useMessageStore.getState()

    store.processWSEvent({
      type: 'init',
      session_id: 'session-1',
      timestamp: 1,
      sequence: 1,
      question: 'Ship it',
      agents: ['agent_a'],
      theme: 'dark',
    })

    expect(useMessageStore.getState().messages.agent_a).toEqual([])
    expect(useMessageStore.getState().currentRound.agent_a).toBe(0)

    store.processWSEvent({
      type: 'structured_event',
      session_id: 'session-1',
      timestamp: 2,
      sequence: 2,
      event_type: 'round_start',
      agent_id: 'agent_a',
      round_number: 0,
      data: {},
    } as unknown as WSEvent)

    expect(
      useMessageStore.getState().messages.agent_a.map((message) =>
        message.type === 'round-divider' ? message.roundNumber : null
      )
    ).toEqual([1])
    expect(useMessageStore.getState().currentRound.agent_a).toBe(1)

    store.processWSEvent({
      type: 'restart',
      session_id: 'session-1',
      timestamp: 3,
      sequence: 3,
      reason: 'Needs another round',
      instructions: 'Try again',
      attempt: 2,
      max_attempts: 3,
    })

    expect(
      useMessageStore.getState().messages.agent_a.map((message) =>
        message.type === 'round-divider' ? message.roundNumber : null
      )
    ).toEqual([1])
    expect(useMessageStore.getState().currentRound.agent_a).toBe(1)

    store.processWSEvent({
      type: 'structured_event',
      session_id: 'session-1',
      timestamp: 4,
      sequence: 4,
      event_type: 'round_start',
      agent_id: 'agent_a',
      round_number: 1,
      data: {},
    } as unknown as WSEvent)

    expect(
      useMessageStore.getState().messages.agent_a.map((message) =>
        message.type === 'round-divider' ? message.roundNumber : null
      )
    ).toEqual([1, 2])
    expect(useMessageStore.getState().currentRound.agent_a).toBe(2)
  })

  it('falls back to the next round number when round_start omits round_number', () => {
    const store = useMessageStore.getState()

    store.processWSEvent({
      type: 'init',
      session_id: 'session-2',
      timestamp: 1,
      sequence: 1,
      question: 'Ship it again',
      agents: ['agent_a'],
      theme: 'dark',
    })

    store.processWSEvent({
      type: 'structured_event',
      session_id: 'session-2',
      timestamp: 2,
      sequence: 2,
      event_type: 'round_start',
      agent_id: 'agent_a',
      data: {},
    } as unknown as WSEvent)

    store.processWSEvent({
      type: 'structured_event',
      session_id: 'session-2',
      timestamp: 3,
      sequence: 3,
      event_type: 'round_start',
      agent_id: 'agent_a',
      data: {},
    } as unknown as WSEvent)

    expect(
      useMessageStore.getState().messages.agent_a.map((message) =>
        message.type === 'round-divider' ? message.roundNumber : null
      )
    ).toEqual([1, 2])
  })
})
