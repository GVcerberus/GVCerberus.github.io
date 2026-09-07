document.addEventListener('DOMContentLoaded', function() {
  var languageCache = {};

  // Helper function to build a video element or iframe embed
  function createVideoEmbed(v) {
    if (v.src) {
      // Local video file
      return '<video controls preload="metadata" style="width:100%; height:100%; object-fit:cover;">' +
               '<source src="' + v.src + '" type="' + (v.mimeType || 'video/mp4') + '">' +
               'Your browser does not support the video tag.' +
             '</video>';
    } else if (v.id || v.videoId) {
      // YouTube embed
      var videoId = v.id || v.videoId;
      var title = v.caption || v.who || '';
      return '<iframe src="https://www.youtube-nocookie.com/embed/' + videoId +
             '" title="' + title + '" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>';
    }
    return '';
  }

  function renderVideos(videos) {
    var grid = document.getElementById('videoGrid');
    if (!grid || !videos) return;
    grid.innerHTML = videos.map(function(v) {
      return '<div><div class="video-wrap">' + createVideoEmbed(v) + '</div>' +
        '<div class="video-caption">' + (v.caption || '') + '</div></div>';
    }).join('');
  }

  function renderTestimonials(testimonials) {
    var strip = document.getElementById('testimonialStrip');
    if (!strip || !testimonials) return;
    strip.innerHTML = testimonials.map(function(t) {
      if (t.type === 'video') {
        return '<div class="t-card t-card-video">' +
          '<div class="video-wrap">' + createVideoEmbed(t) + '</div>' +
          '<div class="who">' + t.who + ' <span>' + t.city + '</span></div></div>';
      }
      return '<div class="t-card"><span class="quote-mark">"</span><p>' + t.quote + '</p>' +
        '<div class="who">' + t.who + ' <span>' + t.city + '</span></div></div>';
    }).join('');
  }

  function applyLanguageData(lang, data) {
    document.documentElement.lang = lang;
    document.body.className = 'lang-' + lang;

    // Translate all nodes with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      if (data.dict && data.dict[key] !== undefined) {
        el.innerHTML = data.dict[key];
      }
    });

    // Update switchers state
    document.querySelectorAll('.lang-switch button').forEach(function(btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === lang ? 'true' : 'false');
    });

    // Render dynamic components
    renderVideos(data.videos);
    renderTestimonials(data.testimonials);
  }

  function loadAndSetLang(lang) {
    if (languageCache[lang]) {
      applyLanguageData(lang, languageCache[lang]);
      return;
    }

    fetch('lang/' + lang + '.json')
      .then(function(response) {
        if (!response.ok) throw new Error('Could not fetch language file');
        return response.json();
      })
      .then(function(data) {
        languageCache[lang] = data;
        applyLanguageData(lang, data);
      })
      .catch(function(err) {
        console.error('Language loading error:', err);
      });
  }

  // Initial render (default English)
  loadAndSetLang('en');

  // Event Listener for language switch buttons
  document.querySelectorAll('.lang-switch button').forEach(function(btn) {
    btn.addEventListener('click', function() {
      loadAndSetLang(btn.getAttribute('data-lang'));
    });
  });

  // Image load handlers
  document.querySelectorAll('img').forEach(function(img) {
    img.addEventListener('load', function() {
      var ph = img.parentElement.querySelector('.ph-fallback');
      if (ph) ph.remove();
    });
    img.addEventListener('error', function() {
      img.style.display = 'none';
    });
  });

  // Lightbox handlers
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');

  function openLightbox(btn) {
    var img = btn.querySelector('img');
    if (!img || img.style.display === 'none') return;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.removeAttribute('hidden');
  }

  function closeLightbox() {
    lightbox.setAttribute('hidden', '');
  }

  document.querySelectorAll('.gallery-item').forEach(function(btn) {
    btn.addEventListener('click', function() { openLightbox(btn); });
  });

  var closeBtn = document.querySelector('.lightbox-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', function(e) {
      if (e.target.id === 'lightbox') closeLightbox();
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeLightbox();
  });

  // Fleet slider (Car section: switch between vehicles via tabs, dots, or arrows)
  function initCarSlider() {
    var slides = document.querySelectorAll('.car-slide');
    var tabs = document.querySelectorAll('.car-tab');
    var dots = document.querySelectorAll('.car-dot');
    var prevBtn = document.querySelector('[data-car-nav="prev"]');
    var nextBtn = document.querySelector('[data-car-nav="next"]');
    if (!slides.length) return;

    var current = 0;

    function show(index) {
      var total = slides.length;
      current = ((index % total) + total) % total;
      slides.forEach(function(el, i) { el.classList.toggle('active', i === current); });
      tabs.forEach(function(el, i) { el.classList.toggle('active', i === current); });
      dots.forEach(function(el, i) { el.classList.toggle('active', i === current); });
    }

    tabs.forEach(function(tab, i) {
      tab.addEventListener('click', function() { show(i); });
    });
    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() { show(i); });
    });
    if (prevBtn) prevBtn.addEventListener('click', function() { show(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function() { show(current + 1); });

    show(0);
  }

  initCarSlider();
});
