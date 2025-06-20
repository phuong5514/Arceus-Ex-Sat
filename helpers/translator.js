export default function t(translation_t, key, ...args) {
  let message = translation_t[key] || key;
  args.forEach((arg, index) => {
    message = message.replace(new RegExp(`\\$${index + 1}`, 'g'), arg);
  });
  return message;
}