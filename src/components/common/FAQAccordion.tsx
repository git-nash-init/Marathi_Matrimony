import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQItem } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './FAQAccordion.module.css';

interface FAQAccordionProps {
  items: FAQItem[];
  allowMultiple?: boolean;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ items, allowMultiple = false }) => {
  const { localize } = useLanguage();
  const [openIds, setOpenIds] = useState<string[]>([items[0]?.id || '']);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenIds(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds(prev => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={styles.accordionList}>
      {items.map(item => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id} className={`${styles.item} ${isOpen ? styles.open : ''}`}>
            <button
              type="button"
              className={styles.questionBtn}
              onClick={() => toggleItem(item.id)}
              aria-expanded={isOpen}
            >
              <span className={styles.questionText}>{localize(item.question)}</span>
              <span className={`${styles.iconWrapper} ${isOpen ? styles.rotated : ''}`}>
                <ChevronDown size={20} />
              </span>
            </button>
            {isOpen && (
              <div className={styles.answerWrapper}>
                <p className={styles.answerText}>{localize(item.answer)}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
