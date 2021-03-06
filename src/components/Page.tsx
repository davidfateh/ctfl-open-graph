import React, { useState, useEffect } from 'react';
import {
    Card,
    Note,
    Heading,
    Paragraph,
    Typography,
    TextLink,
    Button,
    SkeletonBodyText,
    SkeletonContainer,
    SkeletonDisplayText,
} from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import { PageExtensionSDK } from '@contentful/app-sdk';

interface PageProps {
    sdk: PageExtensionSDK;
}

// An open graph content type
interface OpenGraphEntry {
    fields: {
        title: {
            'en-US': string;
        };
        type: {
            'en-US': string;
        };
        url: {
            'en-US': string;
        };
        image: {
            'en-US': {
                sys: {
                    id: string;
                };
            };
        };
        content: {
            'en-US': {
                sys: {
                    id: string;
                };
            };
        };
    };
    sys: {
        id: string;
    };
}

// A custom shape for the entry we are going to render in our UI
interface OpenGraphPreview {
    id: string;
    title: string;
    imageUrl: string;
    previewBody: string;
    url: string;
}

interface Content {
    fields: {
        body: {
            'en-US': string;
        };
    };
}

interface Asset {
    fields: {
        file: {
            'en-US': {
                url: string;
            };
        };
    };
}

const Page = (props: PageProps) => {
    // false indicates an error occurred
    // otherwise the entry is loading or loaded
    const [entry, setEntry] = useState<OpenGraphPreview | false>();

    useEffect(() => {
        // Get the entry ID which is passed in via the URL
        // @ts-ignore
        const entryId = props.sdk.parameters?.invocation?.path.replace('/', '');

        // If no entry ID exists, show an error message by setting content to false
        if (!entryId) {
            setEntry(false);
            return;
        }

        // Get the entry data by getting the linked asset and content body
        props.sdk.space.getEntry<OpenGraphEntry>(entryId).then((data) => {
            Promise.all([
                // Grabs the Image asset of the Open Graph content type
                props.sdk.space.getAsset<Asset>(
                    data.fields.image['en-US'].sys.id
                ),
                // Grabs the long text body of the blog post
                props.sdk.space.getEntry<Content>(
                    data.fields.content['en-US'].sys.id
                ),
            ]).then(([asset, content]) => {
                // combine the data from the two `space` calls
                setEntry({
                    title: data.fields.title['en-US'],
                    imageUrl: asset.fields.file['en-US'].url,
                    previewBody: content.fields.body['en-US'],
                    url: data.fields.url['en-US'],
                    id: entryId,
                });
            });
        });
    }, []);

    if (entry === false) {
        return <Note noteType="negative">Error retrieving entry!</Note>;
    }

    return (
        <div
            style={{
                display: 'flex',
                width: '100%',
                height: '100vh',
                alignItems: 'center',
                marginTop: tokens.spacingXl,
                flexDirection: 'column',
            }}
        >
            <div style={{ justifyContent: 'center' }}>
                <SkeletonContainer>
                    <SkeletonDisplayText numberOfLines={1} />
                    <SkeletonBodyText numberOfLines={3} offsetTop={35} />
                </SkeletonContainer>
            </div>
            <Typography>
                <Heading>
                    Open Graph Preview
                </Heading>
            </Typography>
            <Card style={{ width: '260px' }}>
                {!entry ?
                <SkeletonContainer>
                    <SkeletonDisplayText numberOfLines={1} />
                    <SkeletonBodyText numberOfLines={3} offsetTop={35} />
                </SkeletonContainer> : 
                <>
                    <Typography>
                        <TextLink href={entry.url}>{entry.title}</TextLink>
                        <Paragraph>{entry.previewBody}</Paragraph>
                    </Typography>
                    <img src={entry.imageUrl} alt="" style={{ width: '200px' }} />
                </>}
            </Card>
            <Button
                buttonType="muted"
                disabled={!entry}
                onClick={() => props.sdk.navigator.openEntry(entry!.id)}
                style={{ margin: `${tokens.spacingXl} 0` }}
            >
                Back to entry
            </Button>
            <div style={{ justifyContent: 'center' }}>
                <SkeletonContainer>
                    <SkeletonDisplayText numberOfLines={1} />
                    <SkeletonBodyText numberOfLines={10} offsetTop={35} />
                </SkeletonContainer>
            </div>
        </div>
    );
};

export default Page;
