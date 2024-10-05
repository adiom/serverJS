module.exports = {
  mode: 'jit',  // Включаем Just-In-Time режим для оптимизации
  purge: ['./public/**/*.html'],  // Указываем пути для очистки неиспользуемых стилей
  darkMode: false,  // Использование темной темы по желанию ('media' или 'class')
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
