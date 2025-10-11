export const dynamic = "force-static";

import Contact from "@/components/main/Contact";

export default async function ContactPage() {
  return (
    <main className="container-md section-md">
      {/* Contact Form */}
      <section className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 shadow-lg mb-12">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">
            Get In Touch
          </h1>
              <p className="text-lg text-black">
                Have a question or want to share a recipe? We'd love to hear
                from you!
          </p>
        </header>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-bold text-black mb-3"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-4 bg-white border-2 border-dashed border-gray-400 rounded-xl focus:border-black focus:outline-none transition-colors text-black placeholder-gray-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold text-black mb-3"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-4 bg-white border-2 border-dashed border-gray-400 rounded-xl focus:border-black focus:outline-none transition-colors text-black placeholder-gray-500"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-bold text-black mb-3"
                >
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-4 bg-white border-2 border-dashed border-gray-400 rounded-xl focus:border-black focus:outline-none transition-colors text-black placeholder-gray-500"
                  placeholder="What is your message about?"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-bold text-black mb-3"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full px-4 py-4 bg-white border-2 border-dashed border-gray-400 rounded-xl focus:border-black focus:outline-none transition-colors text-black placeholder-gray-500 resize-vertical"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <div className="text-center pt-4">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all transform hover:scale-105 text-lg"
                >
                  Send Message
                </button>
            </div>
          </form>
        </section>

      {/* Additional Contact Information */}
      <Contact />
    </main>
  );
}
