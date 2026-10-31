/**
 * BKL ASSOCIATION — Master Client-Side Script
 * Accessible Navigation, Interactive Financial Calculators Suite,
 * FAQ Accordion, and Multi-Step Eligibility Inquiry Wizard.
 */

(function () {
  "use strict";

  // Check prefers-reduced-motion
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ==========================================================================
     1. Navigation & Header
     ========================================================================== */
  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector("[data-nav-toggle]");
  var backToTop = document.querySelector("[data-back-to-top]");

  function setNav(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setNav(!nav.classList.contains("is-open"));
    });
  }

  if (nav) {
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        window.setTimeout(function () {
          setNav(false);
        }, 50);
      });
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setNav(false);
  });

  document.addEventListener("click", function (event) {
    if (!nav || !toggle || !nav.classList.contains("is-open")) return;
    if (!nav.contains(event.target) && !toggle.contains(event.target)) {
      setNav(false);
    }
  });

  // Back to Top Button
  if (backToTop) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          backToTop.classList.toggle("is-visible", window.scrollY > 350);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  // Scroll Reveal Animations
  if (!reduceMotion && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ==========================================================================
     2. FAQ Accordion Components
     ========================================================================== */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var button = item.querySelector("button");
    var panel = item.querySelector(".panel");
    if (!button || !panel) return;

    button.addEventListener("click", function () {
      var isExpanded = button.getAttribute("aria-expanded") === "true";

      // Optional: close other open panels in same accordion container
      var container = item.closest(".faq-container") || item.parentElement;
      if (container) {
        container.querySelectorAll(".faq-item button").forEach(function (otherBtn) {
          if (otherBtn !== button) {
            otherBtn.setAttribute("aria-expanded", "false");
            var otherPanel = otherBtn.parentElement.querySelector(".panel");
            if (otherPanel) otherPanel.hidden = true;
          }
        });
      }

      button.setAttribute("aria-expanded", isExpanded ? "false" : "true");
      panel.hidden = isExpanded;
    });
  });

  /* ==========================================================================
     3. Financial Utilities (Indian Currency Formatter & Math)
     ========================================================================== */
  function formatINR(number) {
    var val = Math.round(Number(number) || 0);
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
      }).format(val);
    } catch (e) {
      return "₹ " + val.toLocaleString("en-IN");
    }
  }

  function formatLakhsCr(number) {
    var n = Number(number) || 0;
    if (n >= 10000000) {
      var cr = (n / 10000000).toFixed(2).replace(/\.00$/, "");
      var unit = Number(cr) > 1 ? " Crores" : " Crore";
      return "₹ " + cr + unit;
    }
    if (n >= 100000) {
      var lk = (n / 100000).toFixed(2).replace(/\.00$/, "");
      return "₹ " + lk + " Lakhs";
    }
    return formatINR(n);
  }

  /**
   * Standard Reducing-Balance EMI Calculation
   * EMI = P × r × (1 + r)^n / ((1 + r)^n − 1)
   */
  function calculateEMI(principal, annualRate, tenureYears) {
    var P = Math.max(0, Number(principal) || 0);
    var rate = Math.max(0, Number(annualRate) || 0);
    var years = Math.max(1, Number(tenureYears) || 1);
    var n = years * 12;

    if (P <= 0) {
      return { emi: 0, totalPayment: 0, totalInterest: 0, principalRatio: 100, interestRatio: 0 };
    }

    if (rate <= 0) {
      var zeroEmi = Math.round(P / n);
      return {
        emi: zeroEmi,
        totalPayment: P,
        totalInterest: 0,
        principalRatio: 100,
        interestRatio: 0
      };
    }

    var r = rate / 12 / 100;
    var factor = Math.pow(1 + r, n);
    var emi = Math.round((P * r * factor) / (factor - 1));
    var totalPayment = emi * n;
    var totalInterest = Math.max(0, totalPayment - P);

    var principalRatio = Math.round((P / totalPayment) * 100);
    var interestRatio = 100 - principalRatio;

    return {
      emi: emi,
      totalPayment: totalPayment,
      totalInterest: totalInterest,
      principalRatio: principalRatio,
      interestRatio: interestRatio
    };
  }

  /* ==========================================================================
     4. Interactive Calculator Suite Controller
     ========================================================================== */
  var calcContainer = document.querySelector("[data-calc-suite]");
  if (calcContainer) {
    // --- Tabs Switching ---
    var tabs = calcContainer.querySelectorAll("[data-calc-tab]");
    var panels = calcContainer.querySelectorAll("[data-calc-panel]");

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var targetId = tab.getAttribute("data-calc-tab");
        tabs.forEach(function (t) {
          t.classList.remove("is-active");
          t.setAttribute("aria-selected", "false");
        });
        panels.forEach(function (p) {
          p.hidden = true;
        });

        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");
        var activePanel = calcContainer.querySelector('[data-calc-panel="' + targetId + '"]');
        if (activePanel) activePanel.hidden = false;
      });
    });

    // --- Tool 1: Home Loan EMI Calculator ---
    var amountRange = document.getElementById("calc-amount-range");
    var amountInput = document.getElementById("calc-amount-input");
    var rateRange = document.getElementById("calc-rate-range");
    var rateInput = document.getElementById("calc-rate-input");
    var tenureRange = document.getElementById("calc-tenure-range");
    var tenureInput = document.getElementById("calc-tenure-input");

    var emiDisplay = document.getElementById("calc-emi-val");
    var principalDisplay = document.getElementById("calc-principal-val");
    var interestDisplay = document.getElementById("calc-interest-val");
    var totalDisplay = document.getElementById("calc-total-val");
    var barPrincipal = document.getElementById("calc-bar-p");
    var barInterest = document.getElementById("calc-bar-i");
    var legendP = document.getElementById("calc-legend-p");
    var legendI = document.getElementById("calc-legend-i");
    var calcApplyBtn = document.getElementById("calc-apply-btn");

    function updateEMICalculator() {
      if (!amountRange || !amountInput || !rateRange || !rateInput || !tenureRange || !tenureInput) return;

      var P = Number(amountRange.value);
      var R = Number(rateRange.value);
      var T = Number(tenureRange.value);

      var res = calculateEMI(P, R, T);

      if (emiDisplay) emiDisplay.textContent = formatINR(res.emi);
      if (principalDisplay) principalDisplay.textContent = formatINR(P);
      if (interestDisplay) interestDisplay.textContent = formatINR(res.totalInterest);
      if (totalDisplay) totalDisplay.textContent = formatINR(res.totalPayment);

      if (barPrincipal && barInterest) {
        barPrincipal.style.width = res.principalRatio + "%";
        barInterest.style.width = res.interestRatio + "%";
      }

      if (legendP) legendP.textContent = "Principal: " + res.principalRatio + "% (" + formatLakhsCr(P) + ")";
      if (legendI) legendI.textContent = "Total Interest: " + res.interestRatio + "% (" + formatLakhsCr(res.totalInterest) + ")";

      // Update CTA with current amount
      if (calcApplyBtn) {
        calcApplyBtn.href = "apply.html?amount=" + P + "&tenure=" + T;
      }
    }

    function bindSync(rangeEl, inputEl, isCurrency) {
      if (!rangeEl || !inputEl) return;
      rangeEl.addEventListener("input", function () {
        inputEl.value = isCurrency ? Number(rangeEl.value).toLocaleString("en-IN") : rangeEl.value;
        updateEMICalculator();
      });
      inputEl.addEventListener("input", function () {
        var raw = Number(String(inputEl.value).replace(/,/g, "").trim()) || 0;
        if (raw >= Number(rangeEl.min) && raw <= Number(rangeEl.max)) {
          rangeEl.value = raw;
        }
        updateEMICalculator();
      });
      inputEl.addEventListener("blur", function () {
        var raw = Number(String(inputEl.value).replace(/,/g, "").trim()) || 0;
        var clamped = Math.max(Number(rangeEl.min), Math.min(Number(rangeEl.max), raw));
        rangeEl.value = clamped;
        inputEl.value = isCurrency ? clamped.toLocaleString("en-IN") : clamped;
        updateEMICalculator();
      });
    }

    bindSync(amountRange, amountInput, true);
    bindSync(rateRange, rateInput, false);
    bindSync(tenureRange, tenureInput, false);
    updateEMICalculator();

    // --- Tool 2: Affordability Estimator ---
    var incomeInput = document.getElementById("afford-income");
    var existingEmiInput = document.getElementById("afford-existing");
    var proposedEmiInput = document.getElementById("afford-proposed");
    var syncEmiBtn = document.getElementById("afford-sync-btn");

    var affordTotalDisplay = document.getElementById("afford-total-emi");
    var affordRemainingDisplay = document.getElementById("afford-remaining");
    var affordDtiBadge = document.getElementById("afford-dti-badge");
    var affordDtiBar = document.getElementById("afford-dti-fill");
    var affordAdvice = document.getElementById("afford-advice");

    function updateAffordability() {
      if (!incomeInput || !existingEmiInput || !proposedEmiInput) return;

      var income = Number(String(incomeInput.value).replace(/,/g, "").trim()) || 0;
      var existing = Number(String(existingEmiInput.value).replace(/,/g, "").trim()) || 0;
      var proposed = Number(String(proposedEmiInput.value).replace(/,/g, "").trim()) || 0;

      var totalEmi = existing + proposed;
      var remaining = income - totalEmi;
      var dti = income > 0 ? Math.round((totalEmi / income) * 100) : 0;

      if (affordTotalDisplay) affordTotalDisplay.textContent = formatINR(totalEmi);
      if (affordRemainingDisplay) affordRemainingDisplay.textContent = formatINR(remaining);

      if (affordDtiBadge && affordDtiBar && affordAdvice) {
        affordDtiBar.style.width = Math.min(100, dti) + "%";

        if (income <= 0) {
          affordDtiBadge.className = "dti-badge";
          affordDtiBadge.textContent = "Enter monthly income";
          affordDtiBar.style.background = "#CBD5E1";
          affordAdvice.textContent = "Please provide your monthly take-home income to calculate debt-to-income ratio.";
        } else if (dti <= 40) {
          affordDtiBadge.className = "dti-badge safe";
          affordDtiBadge.textContent = "EMI Ratio: " + dti + "% (Comfortable)";
          affordDtiBar.style.background = "var(--success)";
          affordAdvice.textContent = "Your total EMI obligation is within the 40% benchmark generally preferred by major lenders.";
        } else if (dti <= 50) {
          affordDtiBadge.className = "dti-badge moderate";
          affordDtiBadge.textContent = "EMI Ratio: " + dti + "% (Moderate)";
          affordDtiBar.style.background = "var(--warning)";
          affordAdvice.textContent = "Your EMI takes up 40%–50% of your net income. Consider extending the tenure to reduce your monthly installment.";
        } else {
          affordDtiBadge.className = "dti-badge high";
          affordDtiBadge.textContent = "EMI Ratio: " + dti + "% (High Debt Burden)";
          affordDtiBar.style.background = "var(--danger)";
          affordAdvice.textContent = "Your total monthly EMIs exceed 50% of income. Lenders may require a co-applicant or lower loan amount to meet eligibility guidelines.";
        }
      }
    }

    [incomeInput, existingEmiInput, proposedEmiInput].forEach(function (inp) {
      if (inp) {
        inp.addEventListener("input", updateAffordability);
      }
    });

    if (syncEmiBtn) {
      syncEmiBtn.addEventListener("click", function () {
        if (amountRange && rateRange && tenureRange && proposedEmiInput) {
          var P = Number(amountRange.value);
          var R = Number(rateRange.value);
          var T = Number(tenureRange.value);
          var res = calculateEMI(P, R, T);
          proposedEmiInput.value = res.emi;
          updateAffordability();
        }
      });
    }

    updateAffordability();

    // --- Tool 3: Scenario Comparison Tool ---
    var scAmtA = document.getElementById("sc-amt-a");
    var scRateA = document.getElementById("sc-rate-a");
    var scTenureA = document.getElementById("sc-tenure-a");

    var scAmtB = document.getElementById("sc-amt-b");
    var scRateB = document.getElementById("sc-rate-b");
    var scTenureB = document.getElementById("sc-tenure-b");

    var scEmiA = document.getElementById("sc-emi-a");
    var scTotalA = document.getElementById("sc-total-a");
    var scInterestA = document.getElementById("sc-interest-a");

    var scEmiB = document.getElementById("sc-emi-b");
    var scTotalB = document.getElementById("sc-total-b");
    var scInterestB = document.getElementById("sc-interest-b");

    var scDiffSummary = document.getElementById("sc-diff-text");

    function updateScenarioComparison() {
      if (!scAmtA || !scRateA || !scTenureA || !scAmtB || !scRateB || !scTenureB) return;

      var pA = Number(scAmtA.value) || 0;
      var rA = Number(scRateA.value) || 0;
      var tA = Number(scTenureA.value) || 1;

      var pB = Number(scAmtB.value) || 0;
      var rB = Number(scRateB.value) || 0;
      var tB = Number(scTenureB.value) || 1;

      var resA = calculateEMI(pA, rA, tA);
      var resB = calculateEMI(pB, rB, tB);

      if (scEmiA) scEmiA.textContent = formatINR(resA.emi);
      if (scTotalA) scTotalA.textContent = formatINR(resA.totalPayment);
      if (scInterestA) scInterestA.textContent = formatINR(resA.totalInterest);

      if (scEmiB) scEmiB.textContent = formatINR(resB.emi);
      if (scTotalB) scTotalB.textContent = formatINR(resB.totalPayment);
      if (scInterestB) scInterestB.textContent = formatINR(resB.totalInterest);

      if (scDiffSummary) {
        var emiDiff = resA.emi - resB.emi;
        var interestDiff = resA.totalInterest - resB.totalInterest;

        var emiMsg = "";
        if (emiDiff > 0) {
          emiMsg = "Scenario A requires <strong>" + formatINR(Math.abs(emiDiff)) + " more per month</strong> than Scenario B.";
        } else if (emiDiff < 0) {
          emiMsg = "Scenario A requires <strong>" + formatINR(Math.abs(emiDiff)) + " less per month</strong> than Scenario B.";
        } else {
          emiMsg = "Both scenarios have the exact same monthly EMI.";
        }

        var intMsg = "";
        if (interestDiff > 0) {
          intMsg = "Over the full tenure, Scenario B saves <strong>" + formatINR(Math.abs(interestDiff)) + " in total interest</strong>.";
        } else if (interestDiff < 0) {
          intMsg = "Over the full tenure, Scenario A saves <strong>" + formatINR(Math.abs(interestDiff)) + " in total interest</strong>.";
        } else {
          intMsg = "Total interest paid across both scenarios is identical.";
        }

        scDiffSummary.innerHTML = emiMsg + " " + intMsg;
      }
    }

    [scAmtA, scRateA, scTenureA, scAmtB, scRateB, scTenureB].forEach(function (inp) {
      if (inp) {
        inp.addEventListener("input", updateScenarioComparison);
      }
    });

    // Preset buttons
    document.querySelectorAll("[data-scenario-preset]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var preset = btn.getAttribute("data-scenario-preset");
        if (preset === "tenure-15-20") {
          scAmtA.value = 3000000;
          scRateA.value = 8.5;
          scTenureA.value = 15;
          scAmtB.value = 3000000;
          scRateB.value = 8.5;
          scTenureB.value = 20;
        } else if (preset === "rate-diff") {
          scAmtA.value = 3500000;
          scRateA.value = 8.5;
          scTenureA.value = 20;
          scAmtB.value = 3500000;
          scRateB.value = 9.25;
          scTenureB.value = 20;
        } else if (preset === "amount-diff") {
          scAmtA.value = 2500000;
          scRateA.value = 8.75;
          scTenureA.value = 20;
          scAmtB.value = 4000000;
          scRateB.value = 8.75;
          scTenureB.value = 20;
        }
        updateScenarioComparison();
      });
    });

    updateScenarioComparison();
  }

  /* ==========================================================================
     5. Multi-Step Eligibility Form Controller (apply.html)
     ========================================================================== */
  var eligibilityForm = document.querySelector("[data-eligibility-form]");
  if (eligibilityForm) {
    var currentStep = 1;
    var isSubmitted = false;

    // Check URL parameters (e.g. ?amount=3000000 from calculator)
    try {
      var urlParams = new URLSearchParams(window.location.search);
      var preAmount = urlParams.get("amount");
      if (preAmount) {
        var amtInput = eligibilityForm.querySelector('[name="amount"]');
        if (amtInput) {
          amtInput.value = Number(preAmount).toLocaleString("en-IN");
        }
      }
    } catch (e) {}

    function showError(row, message) {
      if (!row) return;
      row.classList.add("has-error");
      var err = row.querySelector(".field-error");
      if (err) err.textContent = message;
    }

    function clearError(row) {
      if (!row) return;
      row.classList.remove("has-error");
    }

    function cleanPhone(val) {
      // Strip out spaces, dashes, +91, leading 0
      var s = String(val || "").trim().replace(/[\s\-\(\)]/g, "");
      if (s.indexOf("+91") === 0) s = s.substring(3);
      if (s.indexOf("91") === 0 && s.length === 12) s = s.substring(2);
      if (s.indexOf("0") === 0 && s.length === 11) s = s.substring(1);
      return s;
    }

    function validateStep(step) {
      var valid = true;
      var rows = eligibilityForm.querySelectorAll('[data-step="' + step + '"] .form-row');

      rows.forEach(function (row) {
        clearError(row);
        var field = row.querySelector("input, select, textarea");
        if (!field) return;

        // Radios
        if (field.type === "radio") {
          var group = eligibilityForm.querySelectorAll('[name="' + field.name + '"]');
          var anyChecked = Array.prototype.some.call(group, function (item) {
            return item.checked;
          });
          if (field.hasAttribute("required") && !anyChecked) {
            valid = false;
            showError(row, "Please select an option.");
          }
          return;
        }

        // Checkbox
        if (field.type === "checkbox") {
          if (field.hasAttribute("required") && !field.checked) {
            valid = false;
            showError(row, "You must provide consent before submitting your inquiry.");
          }
          return;
        }

        var val = String(field.value || "").trim();

        // Required text/select
        if (field.hasAttribute("required") && val.length === 0) {
          valid = false;
          showError(row, "This field is required.");
          return;
        }

        // Phone validation
        if (field.name === "phone" && val.length > 0) {
          var cleaned = cleanPhone(val);
          if (!/^[6-9]\d{9}$/.test(cleaned)) {
            valid = false;
            showError(row, "Please enter a valid 10-digit Indian mobile number (starting with 6-9).");
          }
        }

        // Loan Amount validation
        if (field.name === "amount" && val.length > 0) {
          var num = Number(val.replace(/,/g, "").trim());
          if (!Number.isFinite(num) || num < 50000) {
            valid = false;
            showError(row, "Please enter a valid loan amount (minimum ₹50,000).");
          }
        }
      });

      return valid;
    }

    function updateSummary() {
      var summaryList = eligibilityForm.querySelector("[data-summary]");
      if (!summaryList) return;

      var map = {
        loanType: "Selected Loan Type",
        amount: "Desired Loan Amount",
        employment: "Employment Type",
        propertyStatus: "Property Status",
        name: "Full Name",
        phone: "Mobile Contact",
        city: "City / Location",
        income: "Monthly Take-Home Income",
        emi: "Existing Monthly Obligations"
      };

      summaryList.innerHTML = "";

      Object.keys(map).forEach(function (key) {
        var displayVal = "—";
        var radioChecked = eligibilityForm.querySelector('[name="' + key + '"]:checked');
        if (radioChecked) {
          displayVal = radioChecked.value;
        } else if (eligibilityForm.elements[key]) {
          var raw = String(eligibilityForm.elements[key].value || "").trim();
          if (key === "amount" && raw) {
            var n = Number(raw.replace(/,/g, ""));
            displayVal = Number.isFinite(n) ? formatINR(n) : raw;
          } else if (key === "phone" && raw) {
            displayVal = cleanPhone(raw);
          } else {
            displayVal = raw || "—";
          }
        }

        var li = document.createElement("li");
        li.innerHTML = "<span>" + map[key] + "</span><strong></strong>";
        li.querySelector("strong").textContent = displayVal;
        summaryList.appendChild(li);
      });
    }

    function setStep(step) {
      currentStep = step;

      // Toggle Panels
      eligibilityForm.querySelectorAll("[data-step]").forEach(function (panel) {
        var pStep = Number(panel.getAttribute("data-step"));
        panel.hidden = pStep !== currentStep;
      });

      // Update Progress indicators
      eligibilityForm.querySelectorAll(".progress li").forEach(function (item, idx) {
        var s = idx + 1;
        item.classList.toggle("is-active", s === currentStep);
        item.classList.toggle("is-complete", s < currentStep);
      });

      if (currentStep === 3) {
        updateSummary();
      }

      // Smooth scroll to top of form
      var formTop = eligibilityForm.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: formTop, behavior: reduceMotion ? "auto" : "smooth" });

      var heading = eligibilityForm.querySelector('[data-step="' + currentStep + '"] h2');
      if (heading) heading.focus();
    }

    // Step Navigation Clicks
    eligibilityForm.addEventListener("click", function (event) {
      var nextBtn = event.target.closest("[data-next]");
      var prevBtn = event.target.closest("[data-prev]");

      if (nextBtn) {
        if (validateStep(currentStep)) {
          setStep(Math.min(3, currentStep + 1));
        }
      }

      if (prevBtn) {
        setStep(Math.max(1, currentStep - 1));
      }
    });

    // Form Submission
    eligibilityForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (isSubmitted) return;
      if (!validateStep(3)) return;

      isSubmitted = true;
      var submitBtn = eligibilityForm.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      // Save inquiry to localStorage
      try {
        var formData = {
          loanType: eligibilityForm.querySelector('[name="loanType"]:checked') ? eligibilityForm.querySelector('[name="loanType"]:checked').value : '',
          amount: eligibilityForm.elements["amount"] ? eligibilityForm.elements["amount"].value : '',
          employment: eligibilityForm.querySelector('[name="employment"]:checked') ? eligibilityForm.querySelector('[name="employment"]:checked').value : '',
          propertyStatus: eligibilityForm.elements["propertyStatus"] ? eligibilityForm.elements["propertyStatus"].value : '',
          name: eligibilityForm.elements["name"] ? eligibilityForm.elements["name"].value : '',
          phone: eligibilityForm.elements["phone"] ? cleanPhone(eligibilityForm.elements["phone"].value) : '',
          city: eligibilityForm.elements["city"] ? eligibilityForm.elements["city"].value : '',
          income: eligibilityForm.elements["income"] ? eligibilityForm.elements["income"].value : '',
          emi: eligibilityForm.elements["emi"] ? eligibilityForm.elements["emi"].value : '',
          timestamp: new Date().toISOString()
        };
        var storedInquiries = JSON.parse(localStorage.getItem("bkl_inquiries") || "[]");
        storedInquiries.push(formData);
        localStorage.setItem("bkl_inquiries", JSON.stringify(storedInquiries));
      } catch (e) {}

      // Hide steps and progress
      eligibilityForm.querySelectorAll("[data-step]").forEach(function (panel) {
        panel.hidden = true;
      });
      var progress = eligibilityForm.querySelector(".progress");
      if (progress) progress.hidden = true;

      // Show confirmation
      var successBox = eligibilityForm.querySelector(".form-success");
      if (successBox) {
        successBox.classList.add("is-visible");
        successBox.focus();
      }
    });

    // Reset Form
    var resetBtn = eligibilityForm.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        eligibilityForm.reset();
        isSubmitted = false;
        var submitBtn = eligibilityForm.querySelector('[type="submit"]');
        if (submitBtn) submitBtn.disabled = false;

        var successBox = eligibilityForm.querySelector(".form-success");
        if (successBox) successBox.classList.remove("is-visible");

        var progress = eligibilityForm.querySelector(".progress");
        if (progress) progress.hidden = false;

        eligibilityForm.querySelectorAll(".form-row").forEach(clearError);
        setStep(1);
      });
    }

    // Initialize on step 1
    setStep(1);
  }

  /* ==========================================================================
     6. Language Switcher (EN / TA)
     ========================================================================== */
  var translations = {
    // Nav & Common
    "nav_home": { en: "Home", ta: "முகப்பு" },
    "nav_homeloan": { en: "Home Loan", ta: "வீட்டுக் கடன்" },
    "nav_lap": { en: "Loan Against Property", ta: "சொத்து கடன்" },
    "nav_products": { en: "Loan Products", ta: "கடன் சேவைகள்" },
    "nav_calc": { en: "Loan Calculator", ta: "கடன் கணிப்பான்" },
    "nav_apply": { en: "Check Eligibility", ta: "தகுதி சரிபார்ப்பு" },
    "nav_about": { en: "About Us", ta: "எங்களைப் பற்றி" },
    "nav_contact": { en: "Contact Us", ta: "தொடர்புக்கு" },
    "btn_call": { en: "Call Now", ta: "அழைக்கவும்" },
    "btn_call_num": { en: "Call Now: 8072294235", ta: "அழைக்கவும்: 8072294235" },
    "topbar_tag": { en: "Call now for quick approval", ta: "விரைவான ஒப்புதலுக்கு உடனடியாக அழைக்கவும்" },

    // Index Hero
    "hero_eyebrow": { en: "BKL Association &bull; Mortgage &amp; Loan Advisory", ta: "பிகேஎல் அசோசியேஷன் &bull; கடன் ஆலோசனை சேவை" },
    "hero_title": { en: "Your Goals | Our Support | Better Tomorrow", ta: "உங்கள் இலக்குகள் | எங்கள் ஆதரவு | சிறந்த எதிர்காலம்" },
    "hero_copy": { en: "Explore Home Loan and Loan Against Property options with guidance tailored to your financial needs.", ta: "உங்கள் நிதித் தேவைகளுக்கு ஏற்ப வடிவமைக்கப்பட்ட வழிகாட்டுதலுடன் வீட்டுக் கடன் மற்றும் சொத்து மீதான கடன் விருப்பங்களை அறியுங்கள்." },
    "pill_hl": { en: "Home Loan: ₹5 Lakhs to ₹5 Crores", ta: "வீட்டுக் கடன்: ₹5 லட்சம் முதல் ₹5 கோடி வரை" },
    "pill_lap": { en: "LAP: ₹5 Lakhs to ₹1.25 Crores", ta: "சொத்துக் கடன்: ₹5 லட்சம் முதல் ₹1.25 கோடி வரை" },
    "pill_itr": { en: "Without ITR &amp; GST Options*", ta: "ITR &amp; GST இன்றி கடன் பெறும் வசதி*" },
    "pill_plan": { en: "Home Loan: Plan Not Required*", ta: "வீட்டுக் கடன்: பிளான் தேவையில்லை*" },
    "hero_note": { en: "CALL NOW FOR QUICK APPROVAL", ta: "விரைவான ஒப்புதலுக்கு உடனடியாக அழைக்கவும்" },
    "hero_disclaimer": { en: "*Subject to lender requirements, verification, and applicant eligibility. Loan approval is not guaranteed.", ta: "*வங்கி/நிறுவன விதிமுறைகள், சரிபார்ப்பு மற்றும் தகுதிக்கு உட்பட்டது. கடன் ஒப்புதல் உத்தரவாதமில்லை." },
    "btn_check": { en: "Check Your Eligibility &rarr;", ta: "உங்கள் தகுதியை சரிபார்க்கவும் &rarr;" },

    // Loan Products
    "prod_eyebrow": { en: "Our Loan Solutions", ta: "எங்கள் கடன் தீர்வுகள்" },
    "prod_title": { en: "Tailored Financing for Every Goal", ta: "ஒவ்வொரு இலக்குக்கும் ஏற்ற நிதித் தீர்வுகள்" },
    "prod_lead": { en: "Compare our primary loan offerings designed to assist both salaried and self-employed applicants in Tamil Nadu.", ta: "தமிழ்நாட்டில் மாத சம்பளம் பெறுவோர் மற்றும் தொழில் செய்வோருக்கான எங்கள் கடன் சேவைகளை ஒப்பிடுங்கள்." },
    "hl_tag": { en: "Purchase &bull; Construction &bull; Plot", ta: "வீடு வாங்குதல் &bull; கட்டுதல் &bull; மனை" },
    "hl_title": { en: "Home Loan", ta: "வீட்டுக் கடன்" },
    "hl_amount": { en: "₹5 Lakhs to ₹5 Crores", ta: "₹5 லட்சம் முதல் ₹5 கோடி வரை" },
    "hl_desc": { en: "Available without ITR &amp; GST for eligible profiles &bull; Approved building plan not required.", ta: "ITR &amp; GST இன்றி கடன் பெறும் வாய்ப்பு &bull; அப்ரூவ்டு பிளான் தேவையில்லை." },
    "hl_li1": { en: "Purchase of ready, under-construction, or resale homes", ta: "புதிய அல்லது கட்டப்பட்டு வரும் வீடுகள் வாங்குதல்" },
    "hl_li2": { en: "Self-construction and home improvement options", ta: "சுய கட்டுமானம் மற்றும் வீடு புதுப்பித்தல் கடன்" },
    "hl_li3": { en: "Tenures extending up to 20 to 30 years (lender dependent)", ta: "20 முதல் 30 ஆண்டுகள் வரை நீண்ட தவணைக்காலம்" },
    "hl_btn": { en: "Explore Home Loans &rarr;", ta: "வீட்டுக் கடன் விவரங்கள் &rarr;" },

    "lap_tag": { en: "Mortgage &bull; Business &bull; Personal", ta: "அடமானம் &bull; வணிகம் &bull; தனிநபர்" },
    "lap_title": { en: "Loan Against Property (LAP)", ta: "சொத்து மீதான கடன் (LAP)" },
    "lap_amount": { en: "₹5 Lakhs to ₹1.25 Crores", ta: "₹5 லட்சம் முதல் ₹1.25 கோடி வரை" },
    "lap_desc": { en: "Unlock funds against residential or commercial property &bull; Options without ITR &amp; GST.", ta: "குடியிருப்பு அல்லது வணிக சொத்து மூலம் அதிக நிதி &bull; ITR &amp; GST இன்றி கடன் பெறும் வசதி." },
    "lap_li1": { en: "Secured borrowing against titled property ownership", ta: "பட்டா மற்றும் மூலப்பத்திரம் உள்ள சொத்துகளுக்கு கடன்" },
    "lap_li2": { en: "Fund business expansion, education, or medical needs", ta: "வணிக விரிவாக்கம், கல்வி அல்லது மருத்துவத் தேவைகளுக்கு" },
    "lap_li3": { en: "Retain full ownership and continued occupancy of the property", ta: "சொத்தின் முழு உரிமையையும் நீங்களே வைத்திருக்கலாம்" },
    "lap_btn": { en: "Explore LAP Options &rarr;", ta: "சொத்துக் கடன் விவரங்கள் &rarr;" },

    // Calculator Section
    "calc_eyebrow": { en: "Planning &amp; Analysis", ta: "கடன் திட்டமிடல் &amp; ஆய்வு" },
    "calc_title": { en: "Interactive Loan Planning Tools", ta: "கடன் திட்டமிடல் கருவிகள்" },
    "calc_lead": { en: "Estimate your monthly installments, assess your repayment affordability, and compare hypothetical borrowing scenarios before you apply.", ta: "விண்ணப்பிக்கும் முன் உங்கள் மாதாந்திர தவணையை (EMI) கணக்கிட்டு திட்டமிடுங்கள்." },
    "calc_tab1": { en: "1. Home Loan EMI Calculator", ta: "1. வீட்டுக் கடன் EMI கணிப்பான்" },
    "calc_tab2": { en: "2. Affordability Estimator", ta: "2. கடன் வாங்கும் திறன் கணிப்பான்" },
    "calc_tab3": { en: "3. Scenario Comparison", ta: "3. ஒப்பீட்டு ஆய்வு" },

    // Advantages Section
    "adv_eyebrow": { en: "Client Advantages", ta: "வாடிக்கையாளர் நன்மைகள்" },
    "adv_title": { en: "Key Borrowing Advantages", ta: "எங்கள் முக்கிய கடன் நன்மைகள்" },
    "adv_lead": { en: "All loan features, rates, and relationship benefits are qualified according to individual applicant eligibility and participating lender policy.", ta: "அனைத்து கடன் அம்சங்கள் மற்றும் வட்டி விகிதங்கள் தகுதிக்கு உட்பட்டவை." },
    "adv_c1_h": { en: "Competitive Interest Rates", ta: "குறைந்த வட்டி விகிதங்கள்" },
    "adv_c1_p": { en: "Assistance in exploring competitive market rates based on your verified income, credit rating, and property appraisal.", ta: "உங்கள் வருமானம் மற்றும் கிரெடிட் ஸ்கோர் அடிப்படையில் சிறந்த வட்டி விகிதங்களைப் பெற வழிகாட்டுகிறோம்." },
    "adv_c2_h": { en: "Higher Loan Amount", ta: "அதிகபட்ச கடன் தொகை" },
    "adv_c2_p": { en: "Financing ranges up to ₹5 Crores for Home Loans and up to ₹1.25 Crores for Loan Against Property, subject to assessment.", ta: "வீட்டுக் கடனுக்கு ₹5 கோடி வரையிலும், சொத்துக் கடனுக்கு ₹1.25 கோடி வரையிலும் நிதி உதவி." },
    "adv_c3_h": { en: "Flexible Tenure Options", ta: "நெகிழ்வான தவணைக்காலம்" },
    "adv_c3_p": { en: "Structured repayment tenures up to 20 to 30 years to help optimize your monthly EMI and household cash flow.", ta: "மாதாந்திர EMI சுமையை குறைக்க 20 முதல் 30 ஆண்டுகள் வரை நீண்ட கால தவணை வாய்ப்புகள்." },
    "adv_c4_h": { en: "Dedicated Relationship Manager", ta: "பிரத்யேக வாடிக்கையாளர் மேலாளர்" },
    "adv_c4_p": { en: "Direct, personalized guidance from start to disbursement inquiry, answering your queries at 8072294235.", ta: "துவக்கம் முதல் கடன் பட்டுவாடா வரை நேரடி மற்றும் தனிப்பயனாக்கப்பட்ட ஆலோசனை (8072294235)." },

    // Process Section
    "proc_eyebrow": { en: "Trust &amp; Transparency", ta: "நம்பகத்தன்மை &amp; வெளிப்படைத்தன்மை" },
    "proc_title": { en: "How Our Inquiry Process Works", ta: "எங்கள் நடைமுறை எவ்வாறு செயல்படுகிறது" },
    "proc_lead": { en: "We believe in complete transparency. Here is how BKL Association assists you throughout your loan inquiry journey.", ta: "நாங்கள் முழுமையான வெளிப்படைத்தன்மையை வழங்குகிறோம். உங்கள் கடன் நடைமுறையில் நாங்கள் இவ்வாறு உதவுகிறோம்." },
    "proc_s1_h": { en: "Share Initial Inquiry", ta: "விவரங்களை பகிரவும்" },
    "proc_s1_p": { en: "Tell us your loan requirements and property profile via our online form or directly by calling 8072294235.", ta: "உங்கள் கடன் தேவை மற்றும் சொத்து விவரங்களை இணைய படிவம் அல்லது 8072294235 மூலம் பகிரவும்." },
    "proc_s2_h": { en: "Consultation &amp; Review", ta: "ஆலோசனை &amp; மதிப்பாய்வு" },
    "proc_s2_p": { en: "We review your monthly budget, repayment capacity, and explore suitable lender parameters.", ta: "உங்கள் மாதாந்திர பட்ஜெட் மற்றும் திருப்பிச் செலுத்தும் திறனை நாங்கள் மதிப்பாய்வு செய்கிறோம்." },
    "proc_s3_h": { en: "Document Preparation", ta: "ஆவணங்கள் தயாரித்தல்" },
    "proc_s3_p": { en: "Gather your KYC, income proofs, bank statements, and property title papers with our guidance.", ta: "எங்கள் வழிகாட்டுதலுடன் தேவையான வருமான மற்றும் சொத்து ஆவணங்களை தயார் செய்யுங்கள்." },
    "proc_s4_h": { en: "Lender Assessment", ta: "வங்கி மதிப்பீடு &amp; ஒப்புதல்" },
    "proc_s4_p": { en: "The lending institution conducts legal verification, credit underwriting, and final sanction decisions.", ta: "வங்கி அல்லது நிதி நிறுவனம் சட்ட சரிபார்ப்பு மற்றும் இறுதி கடன் ஒப்புதலை வழங்குகிறது." },

    // Pillars
    "tp_1_h": { en: "What You Need to Prepare", ta: "தேவையான ஆவணங்கள்" },
    "tp_1_p": { en: "Keep your PAN, Aadhaar, recent 6 months bank statements, and salary slips or business books accessible for rapid preliminary evaluation.", ta: "பான், ஆதார், 6 மாத வங்கி கணக்கு அறிக்கை, மற்றும் வருமான ஆவணங்களை தயாராக வைத்திருக்கவும்." },
    "tp_2_h": { en: "How Eligibility Varies", ta: "தகுதி எவ்வாறு தீர்மானிக்கப்படுகிறது" },
    "tp_2_p": { en: "Credit score, existing EMI commitments, property age, legal title clearance, and age of applicant all influence lender approval decisions.", ta: "சிபில் ஸ்கோர், முந்தைய கடன்கள், சொத்தின் சட்டப்பூர்வ தகுதி ஆகியவை ஒப்புதலை தீர்மானிக்கின்றன." },
    "tp_3_h": { en: "Repayment Affordability Matters", ta: "திருப்பிச் செலுத்தும் திறன் முக்கியம்" },
    "tp_3_p": { en: "Securing a loan should empower your future, not strain your monthly household budget. We help you choose realistic loan sizes.", ta: "கடன் பெறுவது உங்கள் குடும்ப பட்ஜெட்டை பாதிக்காத வகையில் சரியான தொகையை தேர்ந்தெடுக்க உதவுகிறோம்." },

    // CTA Band
    "cta_title": { en: "Check Your Home Loan Eligibility Today!", ta: "இன்றே உங்கள் கடன் தகுதியை சரிபார்க்கவும்!" },
    "cta_desc": { en: "Take the first step toward your dream home or unlock the value of your property today with expert guidance.", ta: "உங்கள் கனவு இல்லத்தை நோக்கிய முதல் அடியை நிபுணர்களின் வழிகாட்டுதலுடன் இன்றே தொடங்குங்கள்." },
    "cta_btn": { en: "CHECK YOUR ELIGIBILITY &rarr;", ta: "உங்கள் தகுதியை சரிபார்க்கவும் &rarr;" },

    // Footer
    "footer_desc": { en: "Professional loan advisory and inquiry assistance for Home Loans and Loans Against Property across Tamil Nadu.", ta: "தமிழ்நாடு முழுவதும் வீட்டுக் கடன் மற்றும் சொத்து மீதான கடன்களுக்கான தொழில்முறை ஆலோசனை சேவை." },
    "footer_pages": { en: "Pages", ta: "பக்கங்கள்" },
    "footer_comp_h": { en: "Compliance", ta: "விதிமுறை இணக்கம்" },
    "footer_comp_p": { en: "BKL Association assists clients with loan inquiries and application preparation. Final loan sanctions and interest terms are determined exclusively by participating lenders.", ta: "பிகேஎல் அசோசியேஷன் கடன் விண்ணப்ப தயாரிப்புக்கு மட்டுமே வழிகாட்டுகிறது. இறுதி கடன் ஒப்புதல் வங்கிகளால் மட்டுமே தீர்மானிக்கப்படுகிறது." },
    "footer_tag": { en: "QUICK APPROVAL &bull; MINIMUM DOCUMENTATION &bull; HASSLE FREE PROCESS", ta: "விரைவான ஒப்புதல் &bull; குறைந்த ஆவணங்கள் &bull; எளிமையான நடைமுறை" },
    "footer_terms": { en: "*Terms &amp; Conditions Apply.", ta: "*விதிமுறைகள் மற்றும் நிபந்தனைகளுக்கு உட்பட்டது." },

    // About Page
    "about_eyebrow": { en: "About BKL Association", ta: "பிகேஎல் அசோசியேஷன் பற்றி" },
    "about_title": { en: "Dedicated Mortgage &amp; Loan Advisory", ta: "அர்ப்பணிப்புமிக்க அடமான &amp; கடன் ஆலோசனை சேவை" },
    "about_copy": { en: "Assisting families and business owners across Tamil Nadu with transparent, structured borrowing guidance.", ta: "தமிழ்நாடு முழுவதும் வெளிப்படையான, கட்டமைக்கப்பட்ட கடன் வழிகாட்டுதலுடன் குடும்பங்களுக்கும் வணிகர்களுக்கும் உதவுகிறோம்." },
    "about_m1_h": { en: "Our Advisory Mission", ta: "எங்கள் சேவை நோக்கம்" },
    "about_m2_h": { en: "Our Core Principles", ta: "எங்கள் அடிப்படைக் கொள்கைகள்" },

    // Home Loan Page
    "hl_page_eyebrow": { en: "Product Overview &bull; Housing Finance", ta: "சேவை கண்ணோட்டம் &bull; வீட்டுக் கடன்" },
    "hl_page_title": { en: "Make Your Dream Home a Reality", ta: "உங்கள் கனவு இல்லத்தை நனவாக்குங்கள்" },
    "hl_page_copy": { en: "Home Loan assistance from ₹5 Lakhs to ₹5 Crores. Options without ITR &amp; GST available &bull; Approved building plan not required for eligible properties.", ta: "வீட்டுக் கடன் ₹5 லட்சம் முதல் ₹5 கோடி வரை. ITR &amp; GST இன்றியும், அப்ரூவ்டு பிளான் இன்றியும் கடன் பெறும் வாய்ப்பு." },

    // LAP Page
    "lap_page_eyebrow": { en: "Property-Backed Financing", ta: "சொத்து பிணைய நிதி" },
    "lap_page_title": { en: "Unlock the Value of Your Property", ta: "உங்கள் சொத்தின் மதிப்பை முழுமையாக பயன்படுத்துங்கள்" },
    "lap_page_copy": { en: "Loan Against Property from ₹5 Lakhs to ₹1.25 Crores. Monetize the built-up equity in your residential or commercial asset with options without ITR &amp; GST.", ta: "சொத்து மீதான கடன் ₹5 லட்சம் முதல் ₹1.25 கோடி வரை. ITR &amp; GST இன்றியும் கடன் பெறும் வாய்ப்பு." },

    // Apply Page
    "apply_page_eyebrow": { en: "Eligibility Inquiry &bull; 3-Step Wizard", ta: "தகுதி மதிப்பீடு &bull; 3 எளிய படிகள்" },
    "apply_page_title": { en: "Check Your Loan Eligibility", ta: "உங்கள் கடன் தகுதியை சரிபார்க்கவும்" },
    "apply_page_copy": { en: "Complete this simple 3-step initial inquiry to explore loan options tailored to your income and financial profile. No paperwork upload is required at this stage.", ta: "உங்கள் வருமானம் மற்றும் நிதி விவரங்களின்படி கடன் பெற இந்த 3 எளிய படிநிலைகளை பூர்த்தி செய்யுங்கள்." },

    // Contact Page
    "contact_page_eyebrow": { en: "Direct Communication", ta: "நேரடி தொடர்பு" },
    "contact_page_title": { en: "Customer Inquiry Helpline", ta: "வாடிக்கையாளர் உதவி மையம்" },
    "contact_page_copy": { en: "Speak directly with our loan advisory specialists across Tamil Nadu. Reach us at 8072294235 for structured guidance.", ta: "தமிழ்நாட்டில் எங்கள் கடன் ஆலோசனை நிபுணர்களுடன் நேரடியாக தொடர்பு கொள்ள 8072294235 என்ற எண்ணை அழைக்கவும்." }
  };

  function setLanguage(lang) {
    if (lang !== "en" && lang !== "ta") lang = "en";
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("bkl_lang", lang);
      }
    } catch (e) {}

    document.documentElement.lang = lang;
    if (document.body) {
      document.body.classList.toggle("lang-ta", lang === "ta");
    }

    // Update buttons state
    document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
      var isTarget = btn.getAttribute("data-lang-btn") === lang;
      btn.classList.toggle("is-active", isTarget);
      btn.setAttribute("aria-pressed", isTarget ? "true" : "false");
    });

    // Update all i18n nodes
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (translations[key] && translations[key][lang]) {
        var svg = el.querySelector("svg");
        if (svg) {
          var svgCopy = svg.outerHTML;
          el.innerHTML = svgCopy + " " + translations[key][lang];
        } else {
          el.innerHTML = translations[key][lang];
        }
      }
    });
  }

  // Expose globally
  window.setLanguage = setLanguage;

  // Event delegation for clicks
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-lang-btn]");
    if (btn) {
      e.preventDefault();
      var targetLang = btn.getAttribute("data-lang-btn");
      setLanguage(targetLang);
    }
  });

  // Direct bind on DOM ready
  document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var targetLang = btn.getAttribute("data-lang-btn");
      setLanguage(targetLang);
    });
  });

  // Init language from URL param, storage, or default en
  var savedLang = "en";
  try {
    if (typeof window !== "undefined") {
      var urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("lang")) {
        savedLang = urlParams.get("lang");
      } else if (window.localStorage) {
        savedLang = localStorage.getItem("bkl_lang") || "en";
      }
    }
  } catch (e) {}
  setLanguage(savedLang);

})();
