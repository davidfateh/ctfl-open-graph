import React, {useState, useEffect} from 'react';
import tokens from '@contentful/forma-36-tokens'
import { TextInput, Note, Button } from '@contentful/forma-36-react-components';
import { FieldExtensionSDK } from '@contentful/app-sdk';

interface FieldProps {
  sdk: FieldExtensionSDK;
}
// Custom type to denote a blog post content type
interface BlogPost {
  sys: {
    id: string;
  };
  fields: {
    body: object;
    title: {
      'en-US': string;
    };
  };
};

const Field = (props: FieldProps) => {
  // Get the title of the field and create a setter
  const [title, setTitle] = useState(props.sdk.field.getValue() || null);

  useEffect(() => {
    // Resize the field so it isn't cut off in the UI
    props.sdk.window.startAutoResizer();

    // when the value of the `content` field changes, set the title
    props.sdk.entry.fields.content.onValueChanged((entry) => {
      if (!entry) {
        setTitle(null);
        return;
      }

      // The content field is a reference to a blog post.
      // We want to grab that full entry to get the `title` of it
      props.sdk.space.getEntry<BlogPost>(entry.sys.id).then((data) => {
        if (data.fields.title['en-US'] !== title) {
          const title = data.fields.title['en-US'];
          setTitle(title);
          props.sdk.field.setValue(title);
        }
      });
    });
  });

  if (title === null) {
    return <Note noteType="warning">Link a blog post below to assign a title.</Note>
  }

  return (
    <>
      <TextInput disabled value={title} style={{marginBottom: tokens.spacingM}}/>
      <Button onClick={() => props.sdk.navigator.openCurrentAppPage({path: `/${props.sdk.entry.getSys().id}`})} buttonType="naked">Preview Open Graph</Button>
    </>
  );
};

export default Field;
