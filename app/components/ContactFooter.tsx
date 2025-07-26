import ContactForm from './ContactForm';

export default function ContactFooter() {
  return (
    <section id="contact" className="relative py-20 overflow-hidden w-full min-h-[700px] flex items-center">
      <div
        className="absolute inset-0 z-0 bg-[url('/images/live.jpeg')] bg-cover bg-center bg-fixed opacity-20"
        aria-hidden="true"
      ></div>
      <div className="relative z-10 w-full px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-2xl">
            Let's get in touch
          </h2>
          <p className="text-xl md:text-2xl text-white leading-relaxed drop-shadow-2xl">
            Bereit für dein nächstes Projekt? Lass uns gemeinsam deine Audio-Vision verwirklichen.
          </p>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}