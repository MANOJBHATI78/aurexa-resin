import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
}

export function FaqSection({ faqs, className }: { faqs: FaqItem[]; className?: string }) {
  if (!faqs.length) return null;
  return (
    <Accordion type="single" collapsible className={className}>
      {faqs.map((f, i) => (
        <AccordionItem key={f.id || i} value={`faq-${f.id || i}`}>
          <AccordionTrigger className="text-left font-medium text-forest hover:text-forest-light hover:no-underline text-[15px]">
            {f.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground leading-relaxed text-[14px]">
            {f.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
