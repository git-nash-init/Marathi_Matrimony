import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { Button } from '../common/Button';
import { SubscriptionGate } from '../common/SubscriptionGate';
import { UnlockedContact } from './ContactSection';

interface ProfilePdfButtonProps {
  profile: Profile;
  /** Contact details are included only when the viewer has unlocked them */
  contact: UnlockedContact | null;
}

const esc = (s: string | number | null | undefined) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

/** Bilingual (English / मराठी) biodata, rendered from HTML so Devanagari uses the page's loaded fonts. */
function buildBiodataHtml(p: Profile, contact: UnlockedContact | null): string {
  const row = (en: string, mr: string, value: { en: string; mr: string } | string | undefined) => {
    const v = typeof value === 'string' ? { en: value, mr: value } : value;
    if (!v || (!v.en && !v.mr)) return '';
    const val = v.en === v.mr || !v.mr ? esc(v.en) : `${esc(v.en)} / ${esc(v.mr)}`;
    return `<tr><td style="padding:4px 8px;width:38%;color:#555">${en} / ${mr}</td><td style="padding:4px 8px;font-weight:600">${val}</td></tr>`;
  };
  const section = (en: string, mr: string, rows: string) =>
    rows.trim()
      ? `<h3 style="margin:14px 0 4px;color:#7A1F3D;border-bottom:2px solid #C9A227;padding-bottom:3px;font-size:15px">${en} / ${mr}</h3><table style="width:100%;border-collapse:collapse;font-size:12.5px">${rows}</table>`
      : '';

  const fullName = contact?.last_name ? `${p.name.en} ${contact.last_name}` : p.name.en;
  const fullNameMr = contact?.last_name ? `${p.name.mr} ${contact.last_name}` : p.name.mr;

  return `
  <div style="width:700px;padding:28px;font-family:'Noto Sans Devanagari','Segoe UI',Arial,sans-serif;color:#222;background:#fff">
    <div style="display:flex;gap:18px;align-items:center;border-bottom:3px solid #7A1F3D;padding-bottom:12px">
      ${p.photoUrl && !p.photosHidden ? `<img src="${esc(p.photoUrl)}" crossorigin="anonymous" style="width:110px;height:130px;object-fit:cover;border-radius:8px;border:2px solid #C9A227"/>` : ''}
      <div>
        <div style="font-size:12px;color:#7A1F3D;font-weight:700">सनईबंध • Sanaibandh — Biodata / बायोडाटा</div>
        <div style="font-size:22px;font-weight:800">${esc(fullName)}</div>
        <div style="font-size:16px">${esc(fullNameMr)}</div>
        <div style="font-size:12px;color:#555;margin-top:4px">ID: ${esc(p.profileId)} • ${esc(p.age)} yrs / वर्षे • ${esc(p.height)}</div>
      </div>
    </div>
    ${section('Basic Details', 'मूलभूत माहिती', [
      row('Marital Status', 'वैवाहिक स्थिती', p.maritalStatus),
      row('Religion', 'धर्म', p.religion),
      row('Community', 'समाज', p.community),
      row('Mother Tongue', 'मातृभाषा', p.motherTongue),
      row('Gothra', 'गोत्र', p.gothra),
      row('Diet', 'आहार', p.lifestyle?.diet),
    ].join(''))}
    ${section('Education & Career', 'शिक्षण व व्यवसाय', [
      row('Education', 'शिक्षण', p.education),
      row('Details', 'तपशील', p.educationDetail),
      row('Occupation', 'व्यवसाय', p.occupation),
      row('Employed in', 'कार्यक्षेत्र', p.employedIn),
      row('Annual Income', 'वार्षिक उत्पन्न', p.annualIncome),
    ].join(''))}
    ${section('Family Details', 'कौटुंबिक माहिती', [
      row('Family Type', 'कुटुंब प्रकार', p.family?.familyType),
      row('Family Status', 'कौटुंबिक स्थिती', p.family?.familyStatus),
      row('Father', 'वडील', p.family?.fatherOccupation),
      row('Mother', 'आई', p.family?.motherOccupation),
      row('Brothers / Sisters', 'भाऊ / बहिणी', p.family ? `${p.family.brothers} / ${p.family.sisters}` : ''),
      row('Native Place', 'मूळ गाव', p.family?.nativePlace),
    ].join(''))}
    ${section('Horoscope', 'पत्रिका', [
      row('Rashi', 'रास', p.rashi),
      row('Nakshatra', 'नक्षत्र', p.nakshatra),
      row('Manglik', 'मांगलिक', p.manglik),
    ].join(''))}
    ${section('Location', 'स्थळ', [
      row('City', 'शहर', p.city),
      row('State', 'राज्य', p.state),
    ].join(''))}
    ${contact ? section('Contact', 'संपर्क', [
      row('Email', 'ई-मेल', contact.email || ''),
      row('Phone', 'फोन', contact.phone_number || ''),
      row('Address', 'पत्ता', contact.address_line || ''),
    ].join('')) : ''}
    <div style="margin-top:18px;font-size:10px;color:#888">Generated from Sanaibandh. Contact details appear only if unlocked by the downloader.</div>
  </div>`;
}

export const ProfilePdfButton: React.FC<ProfilePdfButtonProps> = ({ profile, contact }) => {
  const { t } = useLanguage();
  const toast = useToast();
  const { has } = useSubscription();
  const [busy, setBusy] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);

  const handleDownload = async () => {
    if (!has('download_pdf')) {
      setGateOpen(true);
      return;
    }
    setBusy(true);
    try {
      // The database checks the entitlement (and logs the download) before anything is generated.
      const { error } = await supabase.rpc('log_pdf_download', { p_target: profile.id });
      if (error) {
        if (error.message.includes('FEATURE_LOCKED')) setGateOpen(true);
        else toast.error(error.message);
        return;
      }

      const { jsPDF } = await import('jspdf');
      const host = document.createElement('div');
      host.style.cssText = 'position:fixed;left:-10000px;top:0;';
      host.innerHTML = buildBiodataHtml(profile, contact);
      document.body.appendChild(host);
      try {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        await doc.html(host.firstElementChild as HTMLElement, {
          x: 20,
          y: 20,
          width: 555,
          windowWidth: 700,
          html2canvas: { useCORS: true, scale: 1 },
        });
        doc.save(`${profile.profileId}-biodata.pdf`);
      } finally {
        document.body.removeChild(host);
      }
    } catch (e) {
      console.error('PDF generation failed', e);
      toast.error(t.premium.pdfFailed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="md" onClick={handleDownload} disabled={busy} icon={<Download size={16} />}>
        {busy ? t.premium.preparing : t.premium.downloadPdf}
      </Button>
      <SubscriptionGate
        isOpen={gateOpen}
        onClose={() => setGateOpen(false)}
        featureLabel="Profile PDF"
        reason={t.premium.pdfGateReason}
      />
    </>
  );
};
