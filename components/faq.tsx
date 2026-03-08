"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, MessageCircle } from "lucide-react";
import { en } from "@/lib/i18n";

const t = en.faq;

export function FAQ() {
  return (
    <section id="faq" className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <Badge
            variant="secondary"
            className="mb-3 bg-secondary text-muted-foreground border-accent-glow font-mono text-xs"
          >
            <HelpCircle className="w-3 h-3 mr-1.5" />
            {t.badge}
          </Badge>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            {t.title}
          </h2>
          <p className="text-sm text-muted-foreground font-mono">
            {t.subtitle}
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {t.items.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <AccordionItem
                value={`item-${index}`}
                className="bg-card border border-accent-glow rounded-lg px-4"
              >
                <AccordionTrigger className="text-left text-sm text-foreground hover:text-accent py-3">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground pb-3 font-mono leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <div className="p-6 rounded-lg bg-secondary border border-accent-glow">
            <MessageCircle className="w-6 h-6 text-accent mx-auto mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">
              {t.contact.title}
            </h3>
            <p className="text-xs text-muted-foreground font-mono mb-4">
              {t.contact.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <a
                href="https://github.com/VoltAgent/awesome-openclaw-skills"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 bg-accent text-accent-foreground rounded text-xs font-mono hover:bg-accent/90 transition-colors"
              >
                {t.contact.github}
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center px-4 py-2 bg-secondary text-foreground rounded text-xs font-mono border border-accent-glow hover:bg-secondary/80 transition-colors"
              >
                {t.contact.discord}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
