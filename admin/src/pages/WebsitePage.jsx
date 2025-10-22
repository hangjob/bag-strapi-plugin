import { Page } from '@strapi/strapi/admin';
import { Box } from '@strapi/design-system';

const WebsitePage = () => {
  // 在这里设置你想要打开的网站地址
  const websiteUrl = 'https://www.google.com';

  return (
    <Page.Main>
      <Page.Title>外部网站</Page.Title>
      <Box 
        padding={4}
        style={{ height: 'calc(100vh - 120px)' }}
      >
        <iframe
          src={websiteUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          title="外部网站"
        />
      </Box>
    </Page.Main>
  );
};

export { WebsitePage };

