export type LocaleCode =
  | 'en-US'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt-BR'
  | 'ja'
  | 'zh-CN';

export interface LocaleOption {
  code: LocaleCode;
  label: string;
}

export const LOCALE_OPTIONS: LocaleOption[] = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'ja', label: '日本語' },
  { code: 'zh-CN', label: '中文 (简体)' },
];

export interface TranslationStrings {
  privacy: string;
  yourSpeedIs: string;
  testPaused: string;
  testingError: string;
  showMoreInfo: string;
  latency: string;
  unloaded: string;
  loaded: string;
  upload: string;
  speed: string;
  client: string;
  servers: string;
  settings: string;
  parallelConnections: string;
  testDuration: string;
  min: string;
  max: string;
  measureLoadedDuringUpload: string;
  alwaysShowAllMetrics: string;
  saveConfigForDevice: string;
  reset: string;
  save: string;
  cancel: string;
  ms: string;
  poweredBy: string;
  pauseTest: string;
  resumeTest: string;
  restartTest: string;
  helpTitle: string;
  shareTitle: string;
  copyResult: string;
  copied: string;
  shareOnFacebook: string;
  shareOnX: string;
  close: string;
  privacyTitle: string;
  privacyBody: string[];
  faqItems: Array<{ q: string; a: string }>;
}

export const TRANSLATIONS: Record<LocaleCode, TranslationStrings> = {
  'en-US': {
    privacy: 'Privacy',
    yourSpeedIs: 'Your Internet speed is',
    testPaused: 'Test paused',
    testingError: 'Could not reach speed test server. Please try again.',
    showMoreInfo: 'Show more info',
    latency: 'Latency',
    unloaded: 'Unloaded',
    loaded: 'Loaded',
    upload: 'Upload',
    speed: 'Speed',
    client: 'Client',
    servers: 'Server(s)',
    settings: 'Settings',
    parallelConnections: 'Parallel connections',
    testDuration: 'Test duration (seconds)',
    min: 'Min:',
    max: 'Max:',
    measureLoadedDuringUpload: 'Measure loaded latency during upload',
    alwaysShowAllMetrics: 'Always show all metrics',
    saveConfigForDevice: 'Save config for this device',
    reset: 'Reset',
    save: 'Save',
    cancel: 'Cancel',
    ms: 'ms',
    poweredBy: 'POWERED BY',
    pauseTest: 'Pause speed test',
    resumeTest: 'Resume speed test',
    restartTest: 'Restart speed test',
    helpTitle: 'Frequently Asked Questions',
    shareTitle: 'Share your Internet speed',
    copyResult: 'Copy result',
    copied: 'Copied',
    shareOnFacebook: 'Share on Facebook',
    shareOnX: 'Share on X',
    close: 'Close',
    privacyTitle: 'Privacy & Test Telemetry',
    privacyBody: [
      'This speed test measures your connection throughput and latency directly between your browser and the active test server endpoints.',
      'Your IP address is inspected solely to display client connection metadata and coordinate parallel streams during the active session.',
      'Configuration changes are only persisted locally in your browser when "Save config for this device" is enabled.',
    ],
    faqItems: [
      {
        q: 'What is FAST.com measuring?',
        a: 'FAST.com estimates your current Internet download speed using parallel HTTP streams of high-entropy data. Clicking "Show more info" also measures your upload speed as well as unloaded and loaded latency.',
      },
      {
        q: 'Why does FAST.com focus primarily on download speed?',
        a: 'Download speed is most relevant for streaming video, browsing, and everyday content consumption. Upload speed and loaded latency are available right beneath the primary result via "Show more info".',
      },
      {
        q: 'What is the difference between unloaded and loaded latency?',
        a: 'Unloaded latency measures round-trip ping time when your network is idle. Loaded latency measures ping time while your connection is actively saturated with download or upload traffic, revealing bufferbloat.',
      },
      {
        q: 'What can I do if I am not getting the speed I pay for?',
        a: 'Try testing over a wired Ethernet connection, pausing background downloads or streams on other devices, restarting your router, or contacting your Internet Service Provider with your measured results.',
      },
    ],
  },
  es: {
    privacy: 'Privacidad',
    yourSpeedIs: 'Tu velocidad de Internet es',
    testPaused: 'Prueba en pausa',
    testingError: 'No se pudo conectar con el servidor de pruebas. Inténtalo de nuevo.',
    showMoreInfo: 'Mostrar más información',
    latency: 'Latencia',
    unloaded: 'Sin carga',
    loaded: 'Con carga',
    upload: 'Subida',
    speed: 'Velocidad',
    client: 'Cliente',
    servers: 'Servidor(es)',
    settings: 'Configuración',
    parallelConnections: 'Conexiones paralelas',
    testDuration: 'Duración de la prueba (segundos)',
    min: 'Mín:',
    max: 'Máx:',
    measureLoadedDuringUpload: 'Medir latencia con carga durante la subida',
    alwaysShowAllMetrics: 'Mostrar siempre todas las métricas',
    saveConfigForDevice: 'Guardar configuración para este dispositivo',
    reset: 'Restablecer',
    save: 'Guardar',
    cancel: 'Cancelar',
    ms: 'ms',
    poweredBy: 'CON TECNOLOGÍA DE',
    pauseTest: 'Pausar prueba',
    resumeTest: 'Reanudar prueba',
    restartTest: 'Reiniciar prueba',
    helpTitle: 'Preguntas frecuentes',
    shareTitle: 'Compartir tu velocidad de Internet',
    copyResult: 'Copiar resultado',
    copied: 'Copiado',
    shareOnFacebook: 'Compartir en Facebook',
    shareOnX: 'Compartir en X',
    close: 'Cerrar',
    privacyTitle: 'Privacidad y telemetría',
    privacyBody: [
      'Esta prueba mide tu velocidad y latencia directamente entre tu navegador y los servidores activos de prueba.',
      'Tu dirección IP se utiliza únicamente para mostrar los metadatos del cliente durante la sesión activa.',
      'La configuración solo se guarda localmente en tu navegador si activas "Guardar configuración para este dispositivo".',
    ],
    faqItems: [
      {
        q: '¿Qué mide FAST.com?',
        a: 'Estima tu velocidad actual de descarga mediante flujos HTTP paralelos. Al pulsar "Mostrar más información" también mide velocidad de subida y latencia sin carga y con carga.',
      },
      {
        q: '¿Qué es la latencia sin carga vs. con carga?',
        a: 'La latencia sin carga mide el tiempo de respuesta en reposo; la latencia con carga mide la respuesta mientras tu conexión descarga o sube datos activamente.',
      },
    ],
  },
  fr: {
    privacy: 'Confidentialité',
    yourSpeedIs: 'Votre vitesse Internet est de',
    testPaused: 'Test en pause',
    testingError: 'Impossible de joindre le serveur de test. Veuillez réessayer.',
    showMoreInfo: 'Afficher plus d’infos',
    latency: 'Latence',
    unloaded: 'Non chargée',
    loaded: 'Chargée',
    upload: 'Envoi',
    speed: 'Vitesse',
    client: 'Client',
    servers: 'Serveur(s)',
    settings: 'Paramètres',
    parallelConnections: 'Connexions parallèles',
    testDuration: 'Durée du test (secondes)',
    min: 'Min :',
    max: 'Max :',
    measureLoadedDuringUpload: 'Mesurer la latence chargée pendant l’envoi',
    alwaysShowAllMetrics: 'Toujours afficher toutes les métriques',
    saveConfigForDevice: 'Enregistrer la config pour cet appareil',
    reset: 'Réinitialiser',
    save: 'Enregistrer',
    cancel: 'Annuler',
    ms: 'ms',
    poweredBy: 'PROPULSÉ PAR',
    pauseTest: 'Mettre en pause',
    resumeTest: 'Reprendre le test',
    restartTest: 'Relancer le test',
    helpTitle: 'Foire aux questions',
    shareTitle: 'Partager votre vitesse Internet',
    copyResult: 'Copier le résultat',
    copied: 'Copié',
    shareOnFacebook: 'Partager sur Facebook',
    shareOnX: 'Partager sur X',
    close: 'Fermer',
    privacyTitle: 'Confidentialité et télémétrie',
    privacyBody: [
      'Ce test mesure votre débit et votre latence directement entre votre navigateur et nos points de terminaison.',
      'Votre adresse IP sert uniquement à afficher les informations de connexion pendant la session.',
      'Les paramètres ne sont sauvegardés localement que si l’option dédiée est cochée.',
    ],
    faqItems: [
      {
        q: 'Que mesure FAST.com ?',
        a: 'FAST.com estime votre vitesse de téléchargement actuelle et, via « Afficher plus d’infos », mesure également l’envoi et la latence à vide et en charge.',
      },
    ],
  },
  de: {
    privacy: 'Datenschutz',
    yourSpeedIs: 'Ihre Internet-Geschwindigkeit beträgt',
    testPaused: 'Test pausiert',
    testingError: 'Testserver nicht erreichbar. Bitte erneut versuchen.',
    showMoreInfo: 'Weitere Informationen',
    latency: 'Latenz',
    unloaded: 'Unbelastet',
    loaded: 'Belastet',
    upload: 'Upload',
    speed: 'Geschwindigkeit',
    client: 'Client',
    servers: 'Server',
    settings: 'Einstellungen',
    parallelConnections: 'Parallele Verbindungen',
    testDuration: 'Testdauer (Sekunden)',
    min: 'Min:',
    max: 'Max:',
    measureLoadedDuringUpload: 'Belastete Latenz beim Upload messen',
    alwaysShowAllMetrics: 'Immer alle Messwerte anzeigen',
    saveConfigForDevice: 'Konfiguration für dieses Gerät speichern',
    reset: 'Zurücksetzen',
    save: 'Speichern',
    cancel: 'Abbrechen',
    ms: 'ms',
    poweredBy: 'BEREITGESTELLT VON',
    pauseTest: 'Test pausieren',
    resumeTest: 'Test fortsetzen',
    restartTest: 'Test neu starten',
    helpTitle: 'Häufig gestellte Fragen',
    shareTitle: 'Internet-Geschwindigkeit teilen',
    copyResult: 'Ergebnis kopieren',
    copied: 'Kopiert',
    shareOnFacebook: 'Auf Facebook teilen',
    shareOnX: 'Auf X teilen',
    close: 'Schließen',
    privacyTitle: 'Datenschutz & Messung',
    privacyBody: [
      'Dieser Test misst Durchsatz und Latenz direkt zwischen Ihrem Browser und den Test-Endpunkten.',
      'Ihre IP-Adresse wird nur zur Anzeige der Verbindungsdaten während des Tests ausgewertet.',
      'Einstellungen werden nur lokal gespeichert, wenn die Option aktiviert ist.',
    ],
    faqItems: [
      {
        q: 'Was misst FAST.com?',
        a: 'FAST.com ermittelt Ihre aktuelle Download-Geschwindigkeit sowie über „Weitere Informationen“ auch Upload-Rate und Latenz mit/ohne Last.',
      },
    ],
  },
  'pt-BR': {
    privacy: 'Privacidade',
    yourSpeedIs: 'A velocidade da sua Internet é',
    testPaused: 'Teste pausado',
    testingError: 'Não foi possível conectar ao servidor de teste. Tente novamente.',
    showMoreInfo: 'Mostrar mais informações',
    latency: 'Latência',
    unloaded: 'Sem carga',
    loaded: 'Com carga',
    upload: 'Upload',
    speed: 'Velocidade',
    client: 'Cliente',
    servers: 'Servidor(es)',
    settings: 'Configurações',
    parallelConnections: 'Conexões paralelas',
    testDuration: 'Duração do teste (segundos)',
    min: 'Mín:',
    max: 'Máx:',
    measureLoadedDuringUpload: 'Medir latência com carga durante o upload',
    alwaysShowAllMetrics: 'Sempre mostrar todas as métricas',
    saveConfigForDevice: 'Salvar configuração neste dispositivo',
    reset: 'Redefinir',
    save: 'Salvar',
    cancel: 'Cancelar',
    ms: 'ms',
    poweredBy: 'DESENVOLVIDO POR',
    pauseTest: 'Pausar teste',
    resumeTest: 'Retomar teste',
    restartTest: 'Reiniciar teste',
    helpTitle: 'Perguntas frequentes',
    shareTitle: 'Compartilhar sua velocidade',
    copyResult: 'Copiar resultado',
    copied: 'Copiado',
    shareOnFacebook: 'Compartilhar no Facebook',
    shareOnX: 'Compartilhar no X',
    close: 'Fechar',
    privacyTitle: 'Privacidade e Telemetria',
    privacyBody: [
      'Este teste mede a taxa de transferência e a latência diretamente entre o navegador e o servidor.',
      'Seu endereço IP é usado apenas para exibir as informações do cliente durante a sessão.',
      'As configurações só são salvas no navegador quando você marca a opção correspondente.',
    ],
    faqItems: [
      {
        q: 'O que o FAST.com mede?',
        a: 'Ele mede sua velocidade de download atual e, ao clicar em "Mostrar mais informações", exibe upload e latência com e sem carga.',
      },
    ],
  },
  ja: {
    privacy: 'プライバシー',
    yourSpeedIs: 'お客様のインターネット速度',
    testPaused: 'テスト一時停止中',
    testingError: 'テストサーバーに接続できませんでした。もう一度お試しください。',
    showMoreInfo: '詳細を表示',
    latency: 'レイテンシ',
    unloaded: 'アンロード済み',
    loaded: 'ロード済み',
    upload: 'アップロード',
    speed: '速度',
    client: 'クライアント',
    servers: 'サーバー',
    settings: '設定',
    parallelConnections: '並列接続',
    testDuration: 'テスト時間 (秒)',
    min: '最小:',
    max: '最大:',
    measureLoadedDuringUpload: 'アップロード中に負荷時レイテンシを測定する',
    alwaysShowAllMetrics: 'すべての指標を常に表示する',
    saveConfigForDevice: 'このデバイスに設定を保存する',
    reset: 'リセット',
    save: '保存',
    cancel: 'キャンセル',
    ms: 'ms',
    poweredBy: 'POWERED BY',
    pauseTest: 'テストを一時停止',
    resumeTest: 'テストを再開',
    restartTest: 'テストを再実行',
    helpTitle: 'よくある質問',
    shareTitle: 'インターネット速度を共有',
    copyResult: '結果をコピー',
    copied: 'コピーしました',
    shareOnFacebook: 'Facebookで共有',
    shareOnX: 'Xで共有',
    close: '閉じる',
    privacyTitle: 'プライバシーと計測について',
    privacyBody: [
      'この速度テストはブラウザとサーバー間の通信速度とレイテンシを直接測定します。',
      'IPアドレスはセッション中の接続情報表示にのみ使用されます。',
      '設定は「このデバイスに設定を保存する」が有効な場合のみローカルに保存されます。',
    ],
    faqItems: [
      {
        q: 'FAST.comは何を測定していますか？',
        a: '現在のダウンロード速度に加え、「詳細を表示」からアップロード速度や無負荷時・負荷時レイテンシを測定します。',
      },
    ],
  },
  'zh-CN': {
    privacy: '隐私',
    yourSpeedIs: '您的互联网速度为',
    testPaused: '测试已暂停',
    testingError: '无法连接测速服务器，请重试。',
    showMoreInfo: '显示详细信息',
    latency: '延迟',
    unloaded: '空载',
    loaded: '负载',
    upload: '上传',
    speed: '速度',
    client: '客户端',
    servers: '服务器',
    settings: '设置',
    parallelConnections: '并行连接数',
    testDuration: '测试时长（秒）',
    min: '最小：',
    max: '最大：',
    measureLoadedDuringUpload: '在上传期间测量负载延迟',
    alwaysShowAllMetrics: '始终显示所有指标',
    saveConfigForDevice: '为此设备保存配置',
    reset: '重置',
    save: '保存',
    cancel: '取消',
    ms: 'ms',
    poweredBy: '技术支持',
    pauseTest: '暂停测速',
    resumeTest: '继续测速',
    restartTest: '重新测速',
    helpTitle: '常见问题',
    shareTitle: '分享您的网络速度',
    copyResult: '复制结果',
    copied: '已复制',
    shareOnFacebook: '分享到 Facebook',
    shareOnX: '分享到 X',
    close: '关闭',
    privacyTitle: '隐私与测速说明',
    privacyBody: [
      '本测速工具直接在您的浏览器与测速节点之间测量吞吐量与网络延迟。',
      '您的 IP 地址仅用于在当前会话中显示客户端连接信息。',
      '仅当勾选“为此设备保存配置”时，参数才会保存在本地浏览器中。',
    ],
    faqItems: [
      {
        q: 'FAST.com 测量哪些指标？',
        a: '测量当前下载速度，并在展开“显示详细信息”后测量上传速度以及空载和负载延迟。',
      },
    ],
  },
};
