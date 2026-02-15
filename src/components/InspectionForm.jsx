import React from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { RISK_QUESTIONS } from './questions.js';

const InspectionForm = () => {
  const { responses, setResponse } = useInspectionStore();

  const renderField = (q) => {
    switch (q.type) {
      case 'range':
        return (
          <div className="mt-2">
            <div className="grid grid-cols-6 gap-1">
              {[0, 1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => setResponse(q.id, val)}
                  className={`py-3 rounded-lg font-bold text-sm transition-all ${
                    responses[q.id] === val
                      ? 'bg-blue-600 text-white shadow-inner scale-95'
                      : 'bg-white text-slate-400 border border-slate-200'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-1 px-1 text-[10px] text-slate-400 font-medium uppercase">
              <span>Critique</span>
              <span>Conforme</span>
            </div>
          </div>
        );

      case 'number':
        return (
          <div className="mt-2">
            <input
              type="number"
              value={responses[q.id] || ''}
              onChange={(e) => setResponse(q.id, e.target.value)}
              className="w-full p-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0"
            />
            {q.id === 'nb_extincteurs' && responses['superficie_batie'] > 0 && (
              <p className="text-[11px] text-blue-600 mt-2 font-semibold">
                Norme : {Math.ceil(responses['superficie_batie'] / 150)} extincteurs requis.
              </p>
            )}
          </div>
        );

      default:
        return (
          <input
            type={q.type}
            value={responses[q.id] || ''}
            onChange={(e) => setResponse(q.id, e.target.value)}
            className="w-full p-3 mt-2 rounded-xl bg-white border border-slate-200"
          />
        );
    }
  };

  return (
    <div className="pb-24 space-y-8">
      {RISK_QUESTIONS.map((section) => (
        <div key={section.id} className="space-y-4">
          <h2 className="text-lg font-black text-slate-800 border-l-4 border-blue-600 pl-3">
            {section.title}
          </h2>
          {section.questions.map((q) => (
            <div key={q.id} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              <label className="text-sm font-bold text-slate-600">{q.label}</label>
              {renderField(q)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default InspectionForm;
