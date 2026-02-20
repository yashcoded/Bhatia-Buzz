/**
 * Disposable / temporary email domains that should be rejected at signup.
 * Keeps signups from spam and improves deliverability of verification emails.
 * Extend this set as needed; consider syncing from a maintained list (e.g. disposable-email-domains).
 */
const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com', '10minutemail.net', 'guerrillamail.com', 'guerrillamail.info',
  'guerrillamail.biz', 'guerrillamail.org', 'guerrillamail.de', 'mailinator.com',
  'mailinator.net', 'mailinator2.com', 'tempmail.com', 'tempmail.net', 'temp-mail.org',
  'throwaway.email', 'getnada.com', 'trashmail.com', 'yopmail.com', 'maildrop.cc',
  'sharklasers.com', 'guerrillamailblock.com', 'fakeinbox.com', 'trashmail.ws',
  'mohmal.com', 'dispostable.com', 'mailnesia.com', 'mintemail.com', 'emailondeck.com',
  '33mail.com', 'tempinbox.com', 'inboxkitten.com', 'tmpeml.com', 'tempail.com',
  'discard.email', 'disposable.com', 'tempr.email', 'anonymousemail.me', 'mytemp.email',
  'minuteinbox.com', 'emailfake.com', 'dropmail.me', 'temp-mail.io', 'tempail.ga',
  'mail.tm', 'tmpmail.org', 'tempmailo.com', 'fakeinbox.info', 'spamgourmet.com',
  'mailcatch.com', 'inbox.si', 'mailsac.com', 'spamfree24.org', 'spamfree24.eu',
  'spamfree24.de', 'spamlot.net', 'trashmail.net', 'trashmail.org', 'mytrashmail.com',
  'jetable.org', 'mail-temporaire.fr', 'temp-mail.ru', 'mvrht.com', 'mvrht.net',
  'grr.la', 'guerrillamail.fr', 'guerrillamail.it', 'guerrillamail.es', 'guerrillamail.nl',
  'pokemail.net', 'spam4.me', 'spamcorptastic.com', 'spamgourmet.net', 'spamherelots.com',
  'spamhereplease.com', 'super-auswahl.de', 'supergreatmail.com', 'supermailer.jp',
  'suremail.info', 'svk.jp', 'sweetxxx.de', 'tafmail.com', 'tagyourself.com',
  'talkinator.com', 'taphetcu.com', 'tapihu.com', 'tb-online.net', 'techgroup.me',
  'techemail.com', 'techgroup.me', 'telegmail.com', 'teleosaurs.xyz', 'teleworm.com',
  'teleworm.us', 'temp-mail.live', 'temp-mail.online', 'temp-mail.pro', 'temp-mail.tech',
  'tempail.net', 'tempalias.com', 'tempe-mail.com', 'tempemail.co', 'tempemail.net',
  'tempinbox.co.uk', 'tempmail.co', 'tempmail.de', 'tempmail.it', 'tempmail.pp.ua',
  'tempmail.ru', 'tempmail2.com', 'tempmaildemo.com', 'tempmailer.com', 'tempmailer.de',
  'tempmails.com', 'tempmailspace.com', 'tempmail.us', 'temporarily.de', 'temporarioemail.com.br',
  'temporary-mail.net', 'temporaryemail.net', 'temporaryemail.us', 'temporaryforwarding.com',
  'temporaryinbox.com', 'temporarymailaddress.com', 'tempthe.net', 'thanksnospam.info',
  'thankyou2010.com', 'thc.st', 'thelimestrees.com', 'thisisnotmyrealemail.com',
  'throam.com', 'throwaway.email', 'throwawaymail.com', 'throwawaymail.pp.ua',
  'tilien.com', 'tittbit.in', 'tmailinator.com', 'toiea.com', 'toomail.biz',
  'topranklist.de', 'tradermail.info', 'trash-amil.com', 'trash-mail.at', 'trash-mail.com',
  'trash-mail.de', 'trash-mail.ga', 'trash-mail.gq', 'trash-mail.ml', 'trash-mail.tk',
  'trash2009.com', 'trash2010.com', 'trash2011.com', 'trashbox.eu', 'trashdevil.com',
  'trashdevil.de', 'trashemail.de', 'trashmail.at', 'trashmail.de', 'trashmail.ga',
  'trashmail.gq', 'trashmail.io', 'trashmail.me', 'trashmail.ml', 'trashmail.tk',
  'trashmailer.com', 'trashymail.com', 'trashymail.net', 'trbvm.com', 'trbvm.net',
  'trickmail.net', 'trillianpro.com', 'tryalert.com', 'turual.com', 'twinmail.de',
  'twoweirdtricks.com', 'tyldd.com', 'uggsrock.com', 'umail.net', 'upliftnow.com',
  'uplipht.com', 'uroid.com', 'us.af', 'valemail.net', 'venompen.com', 'veryrealemail.com',
  'viditag.com', 'viewcastmedia.com', 'viewcastmedia.net', 'viewcastmedia.org',
  'viralplays.com', 'vkcode.ru', 'vmani.com', 'vmpanda.com', 'vorga.org', 'votiputox.org',
  'vpn.st', 'vps30.com', 'vps911.com', 'vradportal.com', 'vsimcard.com', 'vubby.com',
  'vuiy.pw', 'vztc.com', 'wasteland.rfc822.org', 'watch-harry-potter.com', 'webemail.me',
  'webm4il.info', 'webuser.in', 'wee.my', 'wefjo.gq', 'weg-werf-email.de', 'wegwerf-email-addressen.de',
  'wegwerf-emails.de', 'wegwerfadresse.de', 'wegwerfemail.com', 'wegwerfemail.de',
  'wegwerfemail.info', 'wegwerfemail.net', 'wegwerfemail.org', 'wegwerfemailadresse.com',
  'wegwerfmail.de', 'wegwerfmail.info', 'wegwerfmail.net', 'wegwerfmail.org',
  'welikecookies.com', 'wemel.top', 'wetrainbayarea.com', 'wetrainbayarea.org',
  'wfgdfhj.tk', 'whatiaas.com', 'whatifanalytics.com', 'whatpaas.com', 'whatsaas.com',
  'whopy.com', 'whtjddn.33mail.com', 'whopy.com', 'wibblesmith.com', 'willhackforfood.biz',
  'willselfdestruct.com', 'wimsg.com', 'winemaven.info', 'wolfsmail.tk', 'writeme.com',
  'wronghead.com', 'wuzup.net', 'wuzupmail.net', 'wwwnew.eu', 'wxnw.net', 'x24.com',
  'xcompress.com', 'xcpy.com', 'xents.com', 'xjoi.com', 'xmail.net', 'xmaily.com',
  'xn--9kq967o.com', 'xoxy.net', 'xrho.com', 'xwaretech.com', 'xwaretech.info',
  'xwaretech.net', 'xww.ro', 'xy9ce.tk', 'yapped.net', 'yep.it', 'yogamaven.com',
  'yopmail.fr', 'yopmail.gq', 'yopmail.net', 'yourdomain.com', 'yourlifesucks.cu.cc',
  'ypmail.webarnak.fr.eu.org', 'yuurok.com', 'z1p.biz', 'za.com', 'zehnminuten.de',
  'zehnminutenmail.de', 'zippymail.info', 'zoaxe.com', 'zoemail.com', 'zoemail.net',
  'zoemail.org', 'zomg.info', 'zxcv.com', 'zxcvbnm.com', 'zzz.com',
]);

/**
 * Returns true if the email's domain is a known disposable/temporary email provider.
 * Use before signup to block spam signups and improve verification deliverability.
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2 || !parts[1]) return false;
  const domain = parts[1];
  return DISPOSABLE_DOMAINS.has(domain);
}

/**
 * Basic format check (local part + @ + domain with TLD).
 * Use alongside isDisposableEmail for full validation.
 */
export function isValidEmailFormat(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test((email || '').trim().toLowerCase());
}
