import * as React from 'react';
import * as Tag from './Tag';
import Cmd from '../Cmd';
import * as Redux from 'redux';
import * as CmdRequest from '../Cmd/Request';
import * as CmdMock from '../Cmd/Mock';
import * as CmdTimeout from '../Cmd/Timeout';
import * as CmdRedirect from '../Cmd/Redirect';
import Request from '../api/Request';
import * as SubmitButton from './SubmitButton';
import Spinner from './Spinner';

type LoadingTagSuggestion =
  | { type: 'NOT_LOADING' }
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; tags: Tag.Content[] }
  | { type: 'ERROR'; error: string };

export interface Content {
  title: string;
  // User being typed at the moment
  authors: string;
  tags: Map<string, Tag.Content>;
  incompleteTag: string;
  content: string;
  submit: SubmitButton.State;
  tagSuggestions: LoadingTagSuggestion;
}

const empty: Content = {
  title: '',
  authors: '',
  tags: new Map(),
  incompleteTag: '',
  content: '',
  submit: { type: 'NOT_SENDING' },
  tagSuggestions: { type: 'NOT_LOADING' }
};

export type Action =
  | { type: 'CHANGE_TITLE_TEXT'; newText: string }
  | { type: 'CHANGE_USER_TEXT'; newText: string }
  | { type: 'CHANGE_CONTENT'; newText: string }
  | { type: 'CHANGE_TAG_TEXT'; newText: string; command?: Cmd<Action> }
  | { type: 'TAG_BACKSPACE' }
  | { type: 'CLOSE_TAG'; tag: Tag.Content }
  | { type: 'SUBMIT'; command: Cmd<Action> }
  | { type: 'GOT_SUBMIT_SUCCESS'; command: Cmd<Action>[] }
  | { type: 'GOT_SUBMIT_FAIL'; error: string }
  | { type: 'GOT_TAGSUGGESTION_SUCCESS'; suggestions: Tag.Content[] }
  | { type: 'GOT_TAGSUGGESTION_FAIL'; error: string }
  | { type: 'CLICK_SUGGESTION'; suggestion: Tag.Content }
  | { type: 'NONE' };

const suggestionsCmd = CmdRequest.make({
  request: Tag.fetchSuggestions,
  onSuccess: data =>
    ({ type: 'GOT_TAGSUGGESTION_SUCCESS', suggestions: data } as Action),
  onError: error => ({ type: 'GOT_TAGSUGGESTION_FAIL', error: error } as Action)
});

const mockSuggestionsCmd = CmdMock.make({
  type: 'GOT_TAGSUGGESTION_SUCCESS',
  suggestions: []
} as Action);

function changeTagTextAction(tagSlug: string): Action {
  // To reduce load on server we only search if > 3.
  // We also don't bother searching if complete
  if (tagSlug.length > 3 && !tagSlug.endsWith(' ')) {
    return {
      type: 'CHANGE_TAG_TEXT',
      newText: tagSlug,
      command: mockSuggestionsCmd
    };
  } else return { type: 'CHANGE_TAG_TEXT', newText: tagSlug };
}

// We can batch commands, meaning the first one will run first
// folllowed by the second one. Finally it will run the last one.
const redirectAfterTimeout = [
  CmdTimeout.make(1000).map(() => ({ type: 'NONE' } as Action)),
  CmdRedirect.make('/').map(() => ({ type: 'NONE' } as Action))
];

function addTag(newTag: Tag.Content, set: Map<string, Tag.Content>) {
  const newTagLowercase: Tag.Content = {
    name: newTag.name.toLowerCase(),
    popularity: newTag.popularity
  };

  return new Map([[newTagLowercase.name, newTagLowercase], ...Array.from(set)]);
}

//Set difference, a\b
function immutableDeleteMap<T>(a: Map<string, T>, b: Map<string, T>) {
  return new Map([...Array.from(a)].filter(([x, _]) => !b.has(x)));
}

function removeTag(tag: Tag.Content, set: Map<string, Tag.Content>) {
  //TODO: Uppercase the first letter and lowercase the rest
  return immutableDeleteMap(set, new Map([[tag.name, tag]]));
}

function withoutLastCharacter(string: string): string {
  return string.slice(0, string.length - 1);
}

export const reducer = (state = empty, action: Action): Content => {
  switch (action.type) {
    case 'TAG_BACKSPACE':
      //TODO
      return state;
    case 'CHANGE_USER_TEXT':
      return { ...state, authors: action.newText };
    case 'CHANGE_TAG_TEXT':
      if (action.newText.endsWith(' ')) {
        const newTag = Tag.fromString(withoutLastCharacter(action.newText));
        return {
          ...state,
          tags: addTag(newTag, state.tags),
          incompleteTag: '',
          tagSuggestions: { type: 'NOT_LOADING' }
        };
      } else if (action.command !== undefined) {
        return {
          ...state,
          incompleteTag: action.newText,
          tagSuggestions: { type: 'LOADING' }
        };
      } else if (action.newText.length === 0) {
        return {
          ...state,
          incompleteTag: action.newText,
          tagSuggestions: { type: 'NOT_LOADING' }
        };
      } else {
        return { ...state, incompleteTag: action.newText };
      }
    case 'CLOSE_TAG':
      return { ...state, tags: removeTag(action.tag, state.tags) };
    case 'CHANGE_CONTENT':
      return { ...state, content: action.newText };
    case 'SUBMIT':
      return { ...state, submit: { type: 'SENDING' } };
    case 'CHANGE_TITLE_TEXT':
      return { ...state, title: action.newText };
    case 'GOT_SUBMIT_SUCCESS':
      return { ...empty, submit: { type: 'SUCCESS' } };
    case 'GOT_SUBMIT_FAIL':
      return { ...empty, submit: { type: 'ERROR', error: action.error } };
    case 'GOT_TAGSUGGESTION_SUCCESS':
      if (state.incompleteTag.length !== 0)
        return {
          ...state,
          tagSuggestions: { type: 'SUCCESS', tags: action.suggestions }
        };
      // Tag already created, no need to show
      else return { ...state, tagSuggestions: { type: 'NOT_LOADING' } };
    case 'GOT_TAGSUGGESTION_FAIL':
      return {
        ...state,
        tagSuggestions: { type: 'ERROR', error: action.error }
      };
    case 'CLICK_SUGGESTION':
      return {
        ...state,
        incompleteTag: '',
        tagSuggestions: { type: 'NOT_LOADING' },
        tags: addTag(action.suggestion, state.tags)
      };
    case 'NONE':
      return state;
    default:
      return state;
  }
};

type Props = Content & { dispatch: (action: Action) => any };

const extractTags = (tags: Map<string, Tag.Content>): Tag.Content[] => {
  const asArray = Array.from(tags);
  return asArray.map(([_, value]) => value);
};

const sendFormCmd = CmdMock.make('SUCCESS').map(
  () =>
    ({ type: 'GOT_SUBMIT_SUCCESS', command: redirectAfterTimeout } as Action)
);

//---------------------------------------------------------------------------------
// COMPONENT
//

const SuggestionTooltip = ({ state }: { state: LoadingTagSuggestion }) => {
  switch (state.type) {
    case 'ERROR':
      return <></>;
    case 'LOADING':
      return <Spinner />;
    case 'NOT_LOADING':
      return <></>;
    case 'SUCCESS':
      return <div>Got tooltip</div>;
  }
};
export const PureComponent = ({ dispatch, ...props }: Props) => (
  <form>
    <label>
      Author:
      <br />
      <input
        type='text'
        value={props.authors}
        onChange={event =>
          dispatch({ type: 'CHANGE_USER_TEXT', newText: event.target.value })
        }
        // placeholder='Author name'
        name='author'
      />
    </label>
    <br />
    <label>
      Content:
      <br />
      <textarea
        value={props.content}
        onChange={event =>
          dispatch({ type: 'CHANGE_CONTENT', newText: event.target.value })
        }
        placeholder='Describe the content here..'
        name='content'
      />
    </label>
    <br />
    <SuggestionTooltip  state={props.tagSuggestions} />
    <label>
      Tags:
      <Tag.Input
        tags={extractTags(props.tags)}
        value={props.incompleteTag}
        onChange={event => dispatch(changeTagTextAction(event))}
        onClose={tag => dispatch({ type: 'CLOSE_TAG', tag: tag })}
      />
      <i >Press space to add the tag</i>
    </label>
    <SubmitButton.Component
      state={props.submit}
      onClick={() => dispatch({ type: 'SUBMIT', command: sendFormCmd })}
      
    />
  </form>
);

//---------------------------------------------------------------------------------
// SEND FORM
//
// const sendFormRequest = Request.post
