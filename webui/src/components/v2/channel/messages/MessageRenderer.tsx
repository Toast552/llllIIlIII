import type {
  ChannelMessage,
  ContentMessage,
  ToolCallMessage,
  AnswerMessage,
  VoteMessage,
  RoundDividerMessage,
  CompletionMessage,
  ErrorMessage,
  SubagentSpawnMessage,
  SubagentStartedMessage,
} from '../../../../stores/v2/messageStore';
import { ContentMessageView } from './ContentMessageView';
import { ToolCallMessageView } from './ToolCallMessageView';
import { AnswerMessageView } from './AnswerMessageView';
import { VoteMessageView } from './VoteMessageView';
import { RoundDividerView } from './RoundDividerView';
import { CompletionMessageView } from './CompletionMessageView';
import { ErrorMessageView } from './StatusMessageView';
import { SubagentSpawnView, SubagentStartedView } from './SubagentMessageView';

interface MessageRendererProps {
  message: ChannelMessage;
}

export function MessageRenderer({ message }: MessageRendererProps) {
  switch (message.type) {
    case 'content':
    case 'thinking':
      return <ContentMessageView message={message as ContentMessage} />;
    case 'tool-call':
      return <ToolCallMessageView message={message as ToolCallMessage} />;
    case 'answer':
      return <AnswerMessageView message={message as AnswerMessage} />;
    case 'vote':
      return <VoteMessageView message={message as VoteMessage} />;
    case 'round-divider':
      return <RoundDividerView message={message as RoundDividerMessage} />;
    case 'completion':
      return <CompletionMessageView message={message as CompletionMessage} />;
    case 'status':
      return null;
    case 'error':
      return <ErrorMessageView message={message as ErrorMessage} />;
    case 'tool-result':
      return null;
    case 'subagent-spawn':
      return <SubagentSpawnView message={message as SubagentSpawnMessage} />;
    case 'subagent-started':
      return <SubagentStartedView message={message as SubagentStartedMessage} />;
    default:
      return null;
  }
}
