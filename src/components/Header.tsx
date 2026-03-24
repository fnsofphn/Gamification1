import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="w-full py-6 px-4 md:px-8 flex justify-center items-center animate-fade-in-up z-50 relative">
      <Link
        to="/"
        className="text-4xl md:text-5xl vinabrain-logo drop-shadow-md hover:scale-105 transition-transform duration-300"
      >
        VINABRAIN
      </Link>
    </header>
  );
}
