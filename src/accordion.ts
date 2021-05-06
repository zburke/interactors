import { HTML } from "bigtest";
import { isHTMLElement } from "../test/helpers";

const getSummary = (element: HTMLElement) => element.querySelector(".MuiAccordionSummary-root");
const isExpanded = (element: HTMLElement) => getSummary(element)?.getAttribute("aria-expanded") == "true";

const AccordionSummary = HTML.extend<HTMLElement>("MUI Accordion Summary")
  .selector(".MuiAccordionSummary-root")
  .locator((element) => element.getAttribute("aria-label") ?? element.innerText)
  .filters({
    expanded: (element) => element.getAttribute("aria-expanded") == "true",
    disabled: {
      apply: (element) => element.getAttribute("aria-disabled") == "true",
      default: false,
    },
  });

export const Accordion = HTML.extend<HTMLElement>("MUI Accordion")
  .selector(".MuiAccordion-root")
  .locator((element) => {
    const summary = getSummary(element);
    return isHTMLElement(summary) ? summary.getAttribute("aria-label") ?? summary.innerText : "";
  })
  .filters({
    expanded: isExpanded,
    disabled: {
      apply: (element) => getSummary(element)?.getAttribute("aria-disabled") == "true",
      default: false,
    },
  })
  .actions({
    expand: async (interactor) => {
      let expanded = false;

      await interactor.perform((element) => (expanded = isExpanded(element)));

      if (expanded) return;

      await interactor.find(AccordionSummary()).click();
    },
    collapse: async (interactor) => {
      let collapsed = false;

      await interactor.perform((element) => (collapsed = !isExpanded(element)));

      if (collapsed) return;

      await interactor.find(AccordionSummary()).click();
    },
    toggle: (interactor) => interactor.find(AccordionSummary()).click(),
  });
