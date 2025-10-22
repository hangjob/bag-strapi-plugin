import { useIntl } from 'react-intl';

import { getTranslation } from '../utils/getTranslation';

const HomePage = () => {
  const { formatMessage } = useIntl();

  return (
    <div>
      <h1>Welcome to {formatMessage({ id: getTranslation('plugin.name') })}</h1>
    </div>
  );
};

export { HomePage };
