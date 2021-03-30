import React, {useState, useEffect} from 'react';
import tokens from '@contentful/forma-36-tokens'
import { TextInput, Note, Button } from '@contentful/forma-36-react-components';
import { FieldExtensionSDK } from '@contentful/app-sdk';

interface FieldProps {
  sdk: FieldExtensionSDK;
}

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
  const [title, setTitle] = useState(props.sdk.field.getValue() || null);

  useEffect(() => {
    props.sdk.window.startAutoResizer();

    props.sdk.entry.fields.content.onValueChanged((entry) => {
      if (!entry) {
        setTitle(null);
        return;
      }

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
