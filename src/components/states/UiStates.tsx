import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Inbox, Lock, RefreshCw, SearchX, Turtle, WifiOff } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useOnlineStatus } from '../../hooks/useNetworkStatus';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import styles from './UiStates.module.css';

type Action = { label: string; to?: string; onClick?: () => void };

const ActionButton: React.FC<{ action: Action; variant?: 'primary' | 'outline' }> = ({ action, variant = 'primary' }) =>
  action.to ? (
    <Link to={action.to} className={variant === 'primary' ? styles.linkPrimary : styles.linkOutline}>
      {action.label}
    </Link>
  ) : (
    <Button variant={variant} size="sm" onClick={action.onClick}>
      {action.label}
    </Button>
  );

/** State 1: says why the screen is empty and gives one clear next step. */
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: Action;
}> = ({ icon, title, description, action }) => (
  <div className={styles.panel}>
    <div className={styles.icon}>{icon ?? <Inbox size={30} />}</div>
    <h3 className={styles.title}>{title}</h3>
    <p className={styles.text}>{description}</p>
    {action && <div className={styles.actions}><ActionButton action={action} /></div>}
  </div>
);

export interface ErrorDetails {
  what: string;
  cause: string;
  fix: string;
}

/** Turns any failure into what went wrong, whose fault it was, and how to fix it. */
export const describeError = (err: unknown, language: string): ErrorDetails => {
  const mr = language === 'mr';
  const e = (err ?? {}) as { code?: string; message?: string; name?: string };
  const message = (e.message ?? '').toLowerCase();

  const isNetwork =
    (typeof navigator !== 'undefined' && !navigator.onLine) ||
    e.name === 'AbortError' ||
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('timed out');
  if (isNetwork) {
    return {
      what: mr ? 'सर्व्हरशी जोडणी झाली नाही.' : 'We could not reach the server.',
      cause: mr ? 'इंटरनेट जोडणी बंद किंवा खूप मंद आहे. आपली माहिती सुरक्षित आहे.' : 'Your internet connection is off or very slow. Nothing was lost.',
      fix: mr ? 'जोडणी तपासा आणि पुन्हा प्रयत्न करा.' : 'Check your connection and try again.',
    };
  }
  if (e.code === '42501' || message.includes('permission denied') || message.includes('unauthorized')) {
    return {
      what: mr ? 'ही क्रिया करण्याची परवानगी नाही.' : 'You do not have permission to do this.',
      cause: mr ? 'आपल्या खात्याला या विभागाचा प्रवेश नाही किंवा सत्र संपले आहे.' : 'Your account lacks access to this section, or your session has ended.',
      fix: mr ? 'पुन्हा लॉगिन करा किंवा मुख्य प्रशासकाशी संपर्क साधा.' : 'Sign in again, or ask a super admin for access.',
    };
  }
  if (message.includes('rate_limited')) {
    return {
      what: mr ? 'खूप विनंत्या पाठवल्या गेल्या.' : 'Too many requests were sent.',
      cause: mr ? 'गैरवापर टाळण्यासाठी आम्ही मर्यादा ठेवतो.' : 'We limit requests to prevent abuse.',
      fix: mr ? 'एक तासाने पुन्हा प्रयत्न करा.' : 'Please try again in an hour.',
    };
  }
  return {
    what: mr ? 'काहीतरी चुकले.' : 'Something went wrong on our side.',
    cause: mr ? 'ही आमच्या बाजूची अडचण आहे, आपली चूक नाही.' : 'This is our fault, not yours.',
    fix: mr ? 'पुन्हा प्रयत्न करा. अडचण कायम राहिल्यास आम्हाला कळवा.' : 'Try again. If it keeps happening, please contact support.',
  };
};

/** State 3. */
export const ErrorState: React.FC<{ error: unknown; onRetry?: () => void }> = ({ error, onRetry }) => {
  const { language } = useLanguage();
  const d = describeError(error, language);
  return (
    <div className={`${styles.panel} ${styles.panelError}`} role="alert">
      <div className={styles.icon}><AlertTriangle size={30} /></div>
      <h3 className={styles.title}>{d.what}</h3>
      <p className={styles.text}>{d.cause}</p>
      <p className={styles.text}>{d.fix}</p>
      {onRetry && (
        <div className={styles.actions}>
          <Button variant="primary" size="sm" icon={<RefreshCw size={15} />} onClick={onRetry}>
            {language === 'mr' ? 'पुन्हा प्रयत्न करा' : 'Try again'}
          </Button>
        </div>
      )}
    </div>
  );
};

/** State 7: explains why access is missing and always gives a way back. */
export const PermissionDenied: React.FC<{
  title?: string;
  message?: string;
  backTo?: string;
  backLabel?: string;
}> = ({ title, message, backTo = '/dashboard', backLabel }) => {
  const { language } = useLanguage();
  const mr = language === 'mr';
  return (
    <div className={styles.panel} role="alert">
      <div className={styles.icon}><Lock size={30} /></div>
      <h3 className={styles.title}>{title ?? (mr ? 'या पृष्ठाचा प्रवेश नाही' : 'You do not have access to this page')}</h3>
      <p className={styles.text}>
        {message ?? (mr
          ? 'हा विभाग केवळ अधिकृत प्रशासकांसाठी आहे. आपणास प्रवेश हवा असल्यास मुख्य प्रशासकाशी संपर्क साधा.'
          : 'This section is only for authorised admins. If you need access, ask a super admin.')}
      </p>
      <div className={styles.actions}>
        <ActionButton action={{ label: backLabel ?? (mr ? 'मागे जा' : 'Go back'), to: backTo }} />
      </div>
    </div>
  );
};

/** State 6: never a dead end. */
export const NoResults: React.FC<{
  query?: string;
  didYouMean?: string;
  suggestions?: string[];
  onSuggestion?: (value: string) => void;
  onClear?: () => void;
}> = ({ query, didYouMean, suggestions = [], onSuggestion, onClear }) => {
  const { language } = useLanguage();
  const mr = language === 'mr';
  return (
    <div className={styles.panel}>
      <div className={styles.icon}><SearchX size={30} /></div>
      <h3 className={styles.title}>
        {query ? (mr ? `"${query}" साठी काही सापडले नाही` : `Nothing found for "${query}"`) : (mr ? 'काही सापडले नाही' : 'Nothing found')}
      </h3>
      {didYouMean && onSuggestion && (
        <p className={styles.text}>
          {mr ? 'आपल्याला हे म्हणायचे होते का: ' : 'Did you mean: '}
          <button type="button" className={styles.inlineLink} onClick={() => onSuggestion(didYouMean)}>{didYouMean}</button>?
        </p>
      )}
      <p className={styles.text}>{mr ? 'कमी शब्द वापरा किंवा फिल्टर बदला.' : 'Try fewer words or change the filters.'}</p>
      {suggestions.length > 0 && onSuggestion && (
        <div className={styles.chips}>
          {suggestions.map((s) => (
            <button key={s} type="button" className={styles.chip} onClick={() => onSuggestion(s)}>{s}</button>
          ))}
        </div>
      )}
      {onClear && (
        <div className={styles.actions}>
          <Button variant="outline" size="sm" onClick={onClear}>{mr ? 'शोध साफ करा' : 'Clear search'}</Button>
        </div>
      )}
    </div>
  );
};

/** State 10: confirms it happened, reassures, says what happens next. */
export const SuccessPanel: React.FC<{
  title: string;
  message: string;
  nextSteps?: string[];
  action?: Action;
}> = ({ title, message, nextSteps = [], action }) => {
  const { language } = useLanguage();
  return (
    <div className={`${styles.panel} ${styles.panelSuccess}`} role="status">
      <div className={styles.icon}><CheckCircle2 size={30} /></div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.text}>{message}</p>
      {nextSteps.length > 0 && (
        <div className={styles.nextSteps}>
          <strong>{language === 'mr' ? 'पुढे काय होईल' : 'What happens next'}</strong>
          <ol>{nextSteps.map((s) => <li key={s}>{s}</li>)}</ol>
        </div>
      )}
      {action && <div className={styles.actions}><ActionButton action={action} /></div>}
    </div>
  );
};

/** State 5: real progress for uploads. */
export const UploadProgress: React.FC<{ percent: number; label?: string }> = ({ percent, label }) => {
  const value = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className={styles.progressWrap} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={styles.progressLabel}>
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className={styles.progressTrack}><div className={styles.progressBar} style={{ width: `${value}%` }} /></div>
    </div>
  );
};

/** State 5: tells the user the wait is the connection, and offers a lighter option when one exists. */
export const SlowNetworkNotice: React.FC<{ onLighter?: () => void }> = ({ onLighter }) => {
  const { language } = useLanguage();
  const mr = language === 'mr';
  return (
    <div className={styles.banner} role="status">
      <Turtle size={16} />
      <span>{mr ? 'इंटरनेट मंद आहे. यास थोडा वेळ लागू शकतो.' : 'Your connection is slow. This may take a little longer.'}</span>
      {onLighter && (
        <button type="button" className={styles.inlineLink} onClick={onLighter}>
          {mr ? 'फोटोशिवाय पहा' : 'Show without photos'}
        </button>
      )}
    </div>
  );
};

/** State 4: anything already on screen stays visible; this says what still works. */
export const OfflineBanner: React.FC = () => {
  const { language } = useLanguage();
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div className={styles.offline} role="status">
      <WifiOff size={16} />
      <span>
        {language === 'mr'
          ? 'आपण ऑफलाइन आहात. दिसणारी माहिती वाचता येईल; जतन करणे व शोध इंटरनेट आल्यावर चालेल.'
          : 'You are offline. You can still read what is on screen; saving and searching return when you reconnect.'}
      </span>
    </div>
  );
};

/** State 8: shown when a session ends by itself. Form drafts are already saved in this browser. */
export const SessionExpiredDialog: React.FC = () => {
  const { language } = useLanguage();
  const { sessionExpired, clearSessionExpired } = useAuth();
  const navigate = useNavigate();
  const mr = language === 'mr';

  const signInAgain = () => {
    const { pathname, search } = window.location;
    clearSessionExpired();
    navigate('/login', { state: { from: { pathname: pathname + search } } });
  };

  return (
    <Modal isOpen={sessionExpired} onClose={clearSessionExpired} title={mr ? 'आपले सत्र संपले आहे' : 'Your session has ended'}>
      <p className={styles.text} style={{ marginBottom: 20 }}>
        {mr
          ? 'सुरक्षेसाठी आपल्याला लॉग आउट केले आहे. अपूर्ण प्रोफाइल माहिती या ब्राउझरमध्ये जतन आहे. पुन्हा लॉगिन केल्यावर आपण जिथे होतो तिथे परत याल.'
          : 'You were signed out for security. Your unfinished profile details are saved in this browser, and signing in returns you to this page.'}
      </p>
      <div className={styles.actions}>
        <Button variant="primary" size="sm" onClick={signInAgain}>{mr ? 'पुन्हा लॉगिन करा' : 'Sign in again'}</Button>
      </div>
    </Modal>
  );
};
