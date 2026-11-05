/**
 * Le Groenland Business Solutions - Interactive Scripts
 * Multi-language support, responsive navigation, dynamic filters & counters
 */
(function() {
  'use strict';

  // Translation dictionary for French
  var FR = {
    n1: "Accueil",
    n2: "À propos",
    n3: "Spécialités",
    n4: "Comment ça marche",
    n5: "Réseau",
    n6: "FAQ",
    n7: "Contact",
    h1: "Votre partenaire santé de confiance en Afrique subsaharienne",
    hp: "Des options de traitement dans plus de 100 hôpitaux répartis dans 20 pays, chez vous ou à l’étranger, avec un plan sous 48 heures.",
    c1: "Envoyer vos dossiers médicaux",
    c2: "Voir comment ça marche",
    c3: "Envoyer la demande",
    s1: "hôpitaux partenaires",
    s2: "pays partenaires",
    s3: "dossiers traités",
    s4: "pays africains servis",
    s5: "pour un plan de traitement",
    a1: "Le voyage médical, simplifié",
    a2: "Nous aidons les patients d’Afrique subsaharienne à trouver le bon traitement, sur place ou à l’étranger, de votre premier dossier jusqu’à votre rétablissement.",
    a3: "Notre histoire",
    sp: "Des soins dans de nombreuses spécialités",
    sa: "Toutes les spécialités",
    tt: "Ce que disent nos patients",
    b1: "Prêt à parler de votre traitement ?",
    b2: "Envoyez vos dossiers et recevez un plan sous 48 heures.",
    w1: "Ce qui nous distingue",
    pr: "Du premier message au suivi",
    nt: "Pays de nos hôpitaux partenaires",
    fq: "Questions fréquentes",
    ct: "Commencez par vos dossiers médicaux",
    t_badge: "Partenaire direct d'hôpitaux • Zéro frais de consultation",
    t_support: "Support d'urgence 24/7",
    t_search: "Rechercher une spécialité ou une intervention...",
    t_all: "Tous",
    t_wa: "Discuter sur WhatsApp"
  };

  // Language management
  var T = document.querySelectorAll('[data-t]');
  T.forEach(function(e) {
    e.dataset.en = e.innerHTML;
  });

  function setLanguage(langCode) {
    document.documentElement.lang = langCode;
    T.forEach(function(e) {
      if (langCode === 'fr' && FR[e.dataset.t]) {
        e.innerHTML = FR[e.dataset.t];
      } else if (e.dataset.en) {
        e.innerHTML = e.dataset.en;
      }
    });

    document.querySelectorAll('.lg button').forEach(function(btn) {
      btn.classList.toggle('on', btn.dataset.l === langCode);
    });

    try {
      localStorage.setItem('lg', langCode);
    } catch (e) {}
  }

  document.querySelectorAll('.lg button').forEach(function(btn) {
    btn.onclick = function() {
      setLanguage(btn.dataset.l);
    };
  });

  // Highlight current nav item (supports clean URLs and .html fallbacks)
  var rawCurrent = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  var currentPath = (!rawCurrent || rawCurrent === 'index') ? 'index' : rawCurrent;

  document.querySelectorAll('#lk a:not(.btn)').forEach(function(link) {
    var rawHref = (link.getAttribute('href') || '').replace(/\.html$/, '').replace(/^\.\/?/, '');
    var linkTarget = (!rawHref || rawHref === '.') ? 'index' : rawHref;
    link.classList.toggle('on', linkTarget === currentPath);
  });

  // Animated stat counters
  document.querySelectorAll('[data-c]').forEach(function(counterElem) {
    var target = +counterElem.dataset.c;
    var step = 0;
    var totalSteps = 40;
    var timer = setInterval(function() {
      step++;
      counterElem.textContent = Math.round(target * step / totalSteps).toLocaleString() + '+';
      if (step >= totalSteps) {
        clearInterval(timer);
      }
    }, 28);
  });

  // Mobile Menu Toggle
  var menuBtn = document.getElementById('mb');
  var navLinks = document.getElementById('lk');
  if (menuBtn && navLinks) {
    menuBtn.onclick = function() {
      var isOpen = navLinks.classList.toggle('o');
      menuBtn.setAttribute('aria-expanded', isOpen);
      menuBtn.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i> Close' : '<i class="fa-solid fa-bars"></i> Menu';
    };

    // Close when clicking outside
    document.addEventListener('click', function(evt) {
      if (!navLinks.contains(evt.target) && !menuBtn.contains(evt.target) && navLinks.classList.contains('o')) {
        navLinks.classList.remove('o');
        menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i> Menu';
      }
    });
  }

  // Specialty category filtering
  var specialtyFilters = document.querySelectorAll('#spf button');
  var specialtyCards = document.querySelectorAll('#spg .cd');
  if (specialtyFilters.length && specialtyCards.length) {
    specialtyFilters.forEach(function(filterBtn) {
      filterBtn.onclick = function() {
        specialtyFilters.forEach(function(btn) {
          btn.classList.toggle('on', btn === filterBtn);
        });
        var category = filterBtn.dataset.f;
        specialtyCards.forEach(function(card) {
          card.style.display = (category === 'all' || card.dataset.g === category) ? '' : 'none';
        });
      };
    });
  }

  // Specialty live text search
  var searchInput = document.getElementById('sp-search');
  if (searchInput && specialtyCards.length) {
    searchInput.addEventListener('input', function() {
      var query = this.value.toLowerCase().trim();
      specialtyCards.forEach(function(card) {
        var text = card.textContent.toLowerCase();
        card.style.display = (text.indexOf(query) !== -1) ? '' : 'none';
      });
    });
  }

  // Network Region Filtering
  var regionFilters = document.querySelectorAll('#rf button');
  var countryItems = document.querySelectorAll('#fl-list li');
  if (regionFilters.length && countryItems.length) {
    regionFilters.forEach(function(btn) {
      btn.onclick = function() {
        regionFilters.forEach(function(b) {
          b.classList.toggle('on', b === btn);
        });
        var reg = btn.dataset.region;
        countryItems.forEach(function(item) {
          item.style.display = (reg === 'all' || item.dataset.region === reg) ? '' : 'none';
        });
      };
    });
  }

  // Route map background dots
  var dotsContainer = document.getElementById('dots');
  if (dotsContainer) {
    var svgString = '';
    for (var x = 0; x <= 750; x += 15) {
      for (var y = 0; y <= 480; y += 15) {
        var lon = x / 5 - 20;
        var lat = 60 - y / 5;
        var onLand = false;

        if (lat < 37 && lat > -35 && lon > -18 && lon < 51) {
          onLand = !(lat < -5 && lon < 12 && lat > -10);
        }
        if (lat > 35 && lat < 60 && lon > -10 && lon < 40) onLand = true;
        if (lat > 12 && lat < 40 && lon > 34 && lon < 62) onLand = true;
        if (lat > 8 && lat < 35 && lon > 68 && lon < 90) {
          onLand = lon < (lat > 20 ? 88 : 78 + (lat - 8) * 0.2);
        }
        if (lat > 5 && lat < 20 && lon > 118 && lon < 127) onLand = true;

        if (onLand) {
          svgString += '<circle class="dot" cx="' + x + '" cy="' + y + '" r="2.4"/>';
        }
      }
    }
    dotsContainer.innerHTML = svgString;
  }

  // File upload indicator for contact form
  var fileInput = document.getElementById('medical-file');
  var fileLabel = document.getElementById('file-chosen');
  if (fileInput && fileLabel) {
    fileInput.addEventListener('change', function() {
      if (this.files && this.files.length > 0) {
        fileLabel.innerHTML = '<i class="fa-solid fa-file-check" style="color:var(--go)"></i> ' + this.files[0].name + ' (' + (this.files[0].size / (1024 * 1024)).toFixed(2) + ' MB)';
      } else {
        fileLabel.textContent = 'Attach MRI / CT scans or doctor summaries (PDF, JPG, PNG)';
      }
    });
  }

  // Contact form submission to server endpoint
  var contactForm = document.getElementById('f');
  var formStatus = document.getElementById('form-status');
  var submitBtn = document.getElementById('f-submit');

  if (contactForm) {
    contactForm.onsubmit = function(evt) {
      evt.preventDefault();

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting to Medical Desk...';
      }

      if (formStatus) {
        formStatus.style.display = 'none';
        formStatus.className = '';
        formStatus.innerHTML = '';
      }

      var formData = new FormData(contactForm);

      fetch('send-mail.php', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        },
        body: formData
      })
      .then(function(res) {
        return res.json().catch(function() {
          return { success: res.ok, message: res.ok ? 'Enquiry submitted successfully.' : 'Server responded with an error.' };
        });
      })
      .then(function(data) {
        if (formStatus) {
          formStatus.style.display = 'flex';
          if (data.success) {
            formStatus.className = 'form-alert success';
            formStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> <div><strong>Thank you, ' + (data.name || 'Patient') + '!</strong><br>' +
              (data.message || 'Your medical enquiry and reports have been delivered directly to our medical desk (info@legroenland.com). A coordinator will contact you within 12–24 hours.') +
              '</div>';
            contactForm.reset();
            if (fileLabel) {
              fileLabel.textContent = 'Attach MRI / CT scans or doctor summaries (PDF, JPG, PNG)';
            }
          } else {
            formStatus.className = 'form-alert error';
            formStatus.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> <div><strong>Notice:</strong> ' +
              (data.message || 'We could not process your submission. Please try again or reach out on WhatsApp.') +
              '</div>';
          }
          formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      })
      .catch(function(err) {
        if (formStatus) {
          formStatus.style.display = 'flex';
          formStatus.className = 'form-alert error';
          formStatus.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> <div><strong>Notice:</strong> Unable to connect to server. Please try again or contact us directly at <a href="mailto:info@legroenland.com" style="color:inherit;text-decoration:underline;">info@legroenland.com</a> or WhatsApp.</div>';
          formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      })
      .finally(function() {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Treatment Enquiry';
        }
      });
    };
  }

  // Restore saved language preference
  try {
    if (localStorage.getItem('lg') === 'fr') {
      setLanguage('fr');
    }
  } catch (e) {}

})();
