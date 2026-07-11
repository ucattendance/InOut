import React from 'react';
import { toast } from 'react-toastify';

const TOAST_OPTS = {
  autoClose: false,
  closeOnClick: false,
  draggable: false,
  closeButton: false,
};

export function confirmToast({ title, text, confirmText = 'Yes', cancelText = 'Cancel', tone = 'primary' }) {
  return new Promise((resolve) => {
    toast(
      ({ closeToast }) => (
        <div className="ct-box">
          <p className="ct-title">{title}</p>
          {text && <p className="ct-text">{text}</p>}
          <div className="ct-actions">
            <button
              type="button"
              className="ct-btn ct-tone-default"
              onClick={() => { resolve(false); closeToast(); }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`ct-btn ct-tone-${tone}`}
              onClick={() => { resolve(true); closeToast(); }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      ),
      TOAST_OPTS
    );
  });
}

export function promptToast({ title, label, defaultValue = '', placeholder = '', confirmText = 'Save', cancelText = 'Cancel' }) {
  return new Promise((resolve) => {
    let value = defaultValue;
    toast(
      ({ closeToast }) => (
        <div className="ct-box">
          <p className="ct-title">{title}</p>
          {label && <label className="ct-label">{label}</label>}
          <input
            type="text"
            autoFocus
            defaultValue={defaultValue}
            placeholder={placeholder}
            className="ct-input"
            onChange={(e) => { value = e.target.value; }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { resolve(value); closeToast(); }
              if (e.key === 'Escape') { resolve(null); closeToast(); }
            }}
          />
          <div className="ct-actions">
            <button
              type="button"
              className="ct-btn ct-tone-default"
              onClick={() => { resolve(null); closeToast(); }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className="ct-btn ct-tone-primary"
              onClick={() => { resolve(value); closeToast(); }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      ),
      TOAST_OPTS
    );
  });
}

export function choiceToast({ title, text, choices }) {
  return new Promise((resolve) => {
    toast(
      ({ closeToast }) => (
        <div className="ct-box">
          <p className="ct-title">{title}</p>
          {text && <p className="ct-text">{text}</p>}
          <div className="ct-actions">
            {choices.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`ct-btn ct-tone-${c.tone || 'default'}`}
                onClick={() => { resolve(c.key); closeToast(); }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      ),
      TOAST_OPTS
    );
  });
}
