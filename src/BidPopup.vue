<template>
  <div v-if="open" class="bid-modal-backdrop">
    <div class="bid-modal">
      <header class="bid-modal__header">
        <h2 class="bid-modal__title">Bid for {{ roleName }}</h2>
      </header>

      <section class="bid-modal__body">
        <p class="bid-modal__line">
          You are currently
          <span class="bid-modal__highlight">#{{ queuePosition }}</span>
          in line for
          <span class="bid-modal__highlight">{{ roleName }}</span>.
        </p>

        <p class="bid-modal__line">
          Current top bid is
          <span class="bid-modal__highlight">
            {{ currentTopBidDisplay }}
          </span>
          {{ currencyLabel }}.
        </p>

        <p class="bid-modal__line">
          Enter a bid for priority:
        </p>

        <div class="bid-modal__input-row">
          <input
            v-model.number="localBid"
            type="number"
            min="0"
            class="bid-modal__input"
            :placeholder="`Min ${minBid} ${currencyLabel}`"
          />
          <span class="bid-modal__input-label">{{ currencyLabel }}</span>
        </div>

        <p v-if="errorMessage" class="bid-modal__error">
          {{ errorMessage }}
        </p>
      </section>

      <footer class="bid-modal__footer">
        <button class="btn btn--primary" @click="handleSubmit">
          Submit
        </button>
        <button class="btn btn--secondary" @click="handleCancel">
          Cancel
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    /** Whether the popup is visible */
    open: boolean;
    /** Human-friendly role name (Top, Jungle, etc.) */
    roleName: string;
    /** 1 = first in line */
    queuePosition: number;
    /** Current highest bid for this role in credits */
    currentTopBid: number | null;
    /** Minimum allowed bid; can be same as current top bid + 1 from API later */
    minBid?: number;
    /** Label for the currency, e.g. "credits" */
    currencyLabel?: string;
  }>(),
  {
    minBid: 1,
    currencyLabel: 'credits'
  }
);

const emit = defineEmits<{
  /** User submitted a bid */
  (e: 'submit', amount: number): void;
  /** User cancelled / closed the popup */
  (e: 'cancel'): void;
}>();

const localBid = ref<number | null>(null);
const errorMessage = ref<string | null>(null);

const currentTopBidDisplay = computed(() =>
  props.currentTopBid == null ? '0' : props.currentTopBid.toString()
);

/**
 * Whenever the popup opens or currentTopBid changes,
 * pre-fill a reasonable starting bid (topBid + 1 or minBid).
 */
watch(
  () => [props.open, props.currentTopBid, props.minBid],
  () => {
    if (!props.open) return;
    const base = props.currentTopBid ?? 0;
    const suggested = Math.max(base + 1, props.minBid);
    localBid.value = suggested;
    errorMessage.value = null;
  },
  { immediate: true }
);

const handleSubmit = () => {
  errorMessage.value = null;

  if (localBid.value == null || Number.isNaN(localBid.value)) {
    errorMessage.value = 'Please enter a valid bid amount.';
    return;
  }

  if (localBid.value < props.minBid) {
    errorMessage.value = `Bid must be at least ${props.minBid} ${props.currencyLabel}.`;
    return;
  }

  emit('submit', localBid.value);
};

const handleCancel = () => {
  errorMessage.value = null;
  emit('cancel');
};
</script>

<style scoped>
/* Backdrop over the whole lobby */
.bid-modal-backdrop {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at top, rgba(15, 23, 42, 0.8), rgba(3, 7, 18, 0.95));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

/* Dialog box – same visual language as the lobby */
.bid-modal {
  width: min(480px, 95vw);
  border-radius: 8px;
  border: 1px solid #304766;
  box-shadow:
    0 0 0 1px rgba(9, 12, 20, 0.95),
    0 20px 40px rgba(0, 0, 0, 0.85);
  background: radial-gradient(circle at top left, #1b3358 0, #050812 55%, #02040a 100%);
  color: #f5f7ff;
  display: flex;
  flex-direction: column;
}

/* Header */
.bid-modal__header {
  padding: 0.6rem 0.9rem;
  background: linear-gradient(to bottom, #1e3148, #071321);
  border-bottom: 1px solid #182336;
  border-radius: 8px 8px 0 0;
  box-shadow: inset 0 1px 0 rgba(214, 234, 255, 0.12);
}

.bid-modal__title {
  margin: 0;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #f0f4ff;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
}

/* Body */
.bid-modal__body {
  padding: 0.9rem 1rem 0.75rem;
}

.bid-modal__line {
  margin: 0 0 0.35rem;
  font-size: 0.9rem;
}

.bid-modal__highlight {
  color: #ffb547;
  font-weight: 600;
}

/* Input row */
.bid-modal__input-row {
  margin-top: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.bid-modal__input {
  flex: 1;
  padding: 0.4rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #283a54;
  background: #020617;
  color: #f5f7ff;
  font-size: 0.9rem;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.8);
}

.bid-modal__input:focus {
  outline: none;
  border-color: #3ca9ff;
  box-shadow:
    0 0 0 1px rgba(60, 169, 255, 0.9),
    inset 0 1px 2px rgba(0, 0, 0, 0.9);
}

.bid-modal__input-label {
  font-size: 0.85rem;
  color: #9fb4d8;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

/* Error text */
.bid-modal__error {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: #f97373;
}

/* Footer buttons */
.bid-modal__footer {
  padding: 0.75rem 1rem 0.9rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  border-top: 1px solid #182336;
  border-radius: 0 0 8px 8px;
  background: linear-gradient(to bottom, #020617, #020814);
}

/* Buttons – reuse lobby style */
.btn {
  padding: 0.45rem 0.9rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.9);
  box-shadow:
    0 2px 0 #132844,
    0 4px 8px rgba(0, 0, 0, 0.7);
  border: 1px solid transparent;
  transition:
    transform 0.05s ease-out,
    box-shadow 0.05s ease-out,
    filter 0.1s ease-out;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow:
    0 3px 0 #132844,
    0 6px 12px rgba(0, 0, 0, 0.85);
  filter: brightness(1.08);
}

.btn:active {
  transform: translateY(1px);
  box-shadow:
    0 1px 0 #0a1525,
    0 3px 6px rgba(0, 0, 0, 0.9);
}

/* Primary = blue, secondary = dark / cancel */
.btn--primary {
  background: linear-gradient(to bottom, #3f7ac4, #21426f);
  border-color: #1b3b64;
  color: #e5f0ff;
}

.btn--secondary {
  background: linear-gradient(to bottom, #3c4558, #222733);
  border-color: #343a49;
  color: #cbd5f5;
}
</style>
