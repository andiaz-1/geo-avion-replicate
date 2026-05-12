import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LOCATION } from "@/lib/location";
import floorplan from "@/assets/weston-floorplan.png";
import vipPresentation from "@/assets/weston-vip-presentation.jpg";
import vipCocktail from "@/assets/weston-vip-cocktail.jpg";
import vipFront from "@/assets/weston-vip-front.jpg";
import vipReception from "@/assets/weston-vip-reception.jpg";
import vipEntrance from "@/assets/weston-vip-entrance.jpg";
import vipLongTableSet from "@/assets/weston-vip-long-table-set.jpg";
import vipTwoTablesSet from "@/assets/weston-vip-two-tables-set.jpg";
import vipTwoLongTables from "@/assets/weston-vip-two-long-tables.jpg";
import vipTvPresentationSetup from "@/assets/weston-vip-tv-presentation-setup.jpg";
import vipUShape from "@/assets/weston-vip-u-shape.jpg";
import vipValentinesGroup from "@/assets/weston-vip-valentines-group.jpg";
import vipPresentationDinner from "@/assets/weston-vip-presentation-dinner.jpg";

const spaces = [
  {
    name: "VIP Room — Back",
    capacity: "Up to 42 seated",
    description:
      "Located at the back of the VIP suite, this section features a wall-mounted TV ideal for presentations, slideshows, or sports viewing. Available table layouts include U-shaped or long banquet-style configurations.",
    layouts: ["U-shape", "Long banquet table", "Classroom-style"],
  },
  {
    name: "VIP Room — Front",
    capacity: "Up to 24 seated",
    description:
      "The front section of the VIP suite — more intimate, perfect for smaller dinners, rehearsal dinners, or executive lunches. Connects seamlessly to the Back section when booking the entire VIP Room.",
    layouts: ["Long table", "Two parallel tables"],
  },
  {
    name: "Entire VIP Room (Front + Back)",
    capacity: "Up to 66 seated · Private · F&B minimum required",
    description:
      "Combine both VIP sections for full privacy. Ideal for corporate dinners, milestone birthdays, and engagement parties. Includes the TV in the Back section.",
    layouts: ["Mixed seating", "Long tables", "Cocktail reception"],
  },
  {
    name: "Main Dining Room",
    capacity: "Up to 75 seated · Semi-private or buyout",
    description:
      "The heart of the restaurant — long perimeter tables along the windows and intimate four-tops down the center. Available semi-privately or as a full buyout.",
    layouts: ["Restaurant seating", "Long tables along walls", "Cocktail flow"],
  },
  {
    name: "Total Venue Buyout",
    capacity: "Up to 141 guests",
    description:
      "Take over the entire restaurant — VIP Room + Main Dining + Bar. The full Salumeria 104 Weston experience, exclusively yours.",
    layouts: ["Custom layout", "Multi-room flow", "Cocktail + seated"],
  },
];

const galleryImages = [
  { src: vipPresentation, caption: "VIP Back — long table with TV presentation setup" },
  { src: vipCocktail, caption: "VIP Front — cocktail reception" },
  { src: vipFront, caption: "VIP Front — banquet seating along the windows" },
  { src: vipReception, caption: "VIP Room — welcome & check-in setup" },
  { src: vipEntrance, caption: "VIP Room entrance & lounge" },
];

const Spaces = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link to="/" className="font-heading text-lg font-medium tracking-wide">
            {LOCATION.brand} <span className="text-muted-foreground text-sm">· {LOCATION.city}</span>
          </Link>
          <Link
            to="/"
            className="text-xs font-body tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Plan Your Event
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-body tracking-[0.4em] uppercase text-muted-foreground mb-4">
            Spaces & Layouts
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-medium leading-tight">
            Find the right room for your celebration
          </h1>
          <p className="mt-5 text-base text-muted-foreground font-body italic max-w-2xl mx-auto leading-relaxed">
            From intimate front-room dinners to full venue buyouts of 141 guests — explore the floor plan and choose the setting that fits your event.
          </p>
        </motion.div>
      </section>

      {/* Floor plan */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border border-border rounded-sm overflow-hidden bg-card"
        >
          <div className="px-6 py-4 border-b border-border flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-heading text-lg font-medium">Restaurant Floor Plan</h2>
            <p className="text-xs font-body tracking-[0.2em] uppercase text-muted-foreground">
              {LOCATION.addressLine}
            </p>
          </div>
          <div className="bg-[#f5efe4] p-4 sm:p-8">
            <img
              src={floorplan}
              alt="Salumeria 104 Weston floor plan showing VIP Room (Front and Back), Main Room, Bar, and Kitchen"
              className="w-full h-auto"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border text-center text-xs font-body">
            {[
              { label: "VIP Front", value: "24" },
              { label: "VIP Back", value: "42" },
              { label: "Main Room", value: "75" },
              { label: "Full Buyout", value: "141" },
            ].map((s) => (
              <div key={s.label} className="bg-card px-3 py-4">
                <p className="text-muted-foreground tracking-[0.2em] uppercase text-[10px]">{s.label}</p>
                <p className="font-heading text-2xl text-foreground mt-1">{s.value}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">guests max</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Spaces breakdown */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="font-heading text-2xl md:text-3xl font-medium text-center mb-10">
          Each Space, Explained
        </h2>
        <div className="space-y-6">
          {spaces.map((space, i) => (
            <motion.article
              key={space.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="border border-border rounded-sm p-6 md:p-8 bg-card"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                <h3 className="font-heading text-xl font-medium">{space.name}</h3>
                <p className="text-xs font-body tracking-[0.2em] uppercase text-muted-foreground">
                  {space.capacity}
                </p>
              </div>
              <p className="text-sm font-body text-muted-foreground leading-relaxed">
                {space.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {space.layouts.map((layout) => (
                  <span
                    key={layout}
                    className="text-[11px] font-body tracking-wider uppercase border border-border px-3 py-1 rounded-sm text-foreground/70"
                  >
                    {layout}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="font-heading text-2xl md:text-3xl font-medium text-center mb-3">
          The VIP Room in Action
        </h2>
        <p className="text-center text-sm text-muted-foreground font-body italic mb-10">
          Real events at Salumeria 104 Weston
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryImages.map((img, i) => (
            <motion.figure
              key={img.src}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="border border-border rounded-sm overflow-hidden bg-card"
            >
              <img
                src={img.src}
                alt={img.caption}
                className="w-full h-64 object-cover"
                loading="lazy"
              />
              <figcaption className="px-4 py-3 text-xs font-body text-muted-foreground italic">
                {img.caption}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-medium">
            Ready to reserve your space?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground font-body italic">
            Tell us about your event in a few quick steps and our coordinator will follow up.
          </p>
          <Link
            to="/"
            className="inline-block mt-8 border border-foreground bg-foreground text-background px-8 py-4 text-xs font-body font-medium tracking-[0.25em] uppercase rounded-sm hover:bg-transparent hover:text-foreground transition-all duration-300"
          >
            Plan Your Event
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Spaces;
