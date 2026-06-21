import logo from '../assets/logo.png';

const PluginIcon = () => (
  <img
    src={logo}
    alt=""
    aria-hidden
    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
  />
);

export { PluginIcon };
