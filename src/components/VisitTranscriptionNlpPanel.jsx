import React, { useState } from "react";
import { FileText, TrendingUp, Sparkles, Stethoscope, GitCompare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Transcription + NLP sections aligned with Visit Details, styled for Report Summary (teal theme).
 * `visit` is a partial visit object with optional transcription, keyword_analysis, etc.
 */
export default function VisitTranscriptionNlpPanel({ visit, usingDemoFallback }) {
  const [showComparison, setShowComparison] = useState(false);

  if (!visit) {
    return (
      <p className="text-sm text-teal-700 py-6">
        No visit data loaded for transcription and NLP.
      </p>
    );
  }

  const v = visit;
  const hasTranscription = Boolean(v.transcription);
  const hasKw = Boolean(v.keyword_analysis);
  const hasSent = Boolean(v.sentiment_analysis);
  const hasSem = Boolean(v.semantic_analysis);
  const hasNotes = Boolean(v.physician_notes);
  const hasComparison = Boolean(v.ai_comparison);
  const hasSegments = v.speaker_segments && v.speaker_segments.length > 0;

  if (!hasTranscription && !hasKw && !hasSent && !hasSem && !hasNotes && !hasComparison) {
    return (
      <div className="rounded-lg border border-dashed border-teal-300 bg-teal-50/50 p-6 text-center">
        <p className="text-sm text-teal-800">
          No transcription, NLP, or model comparison data is stored for this visit yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {usingDemoFallback ? (
        <p className="text-xs text-teal-600 rounded-md border border-teal-200 bg-teal-50/80 px-3 py-2">
          Showing sample transcription and NLP where this visit has no saved data yet.
        </p>
      ) : null}

      {hasTranscription && (
        <Card className="border-teal-200 bg-white/80 backdrop-blur shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-teal-900 text-base">
              <FileText className="w-5 h-5 text-teal-700" />
              Patient transcription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-72 overflow-y-auto rounded-md border border-teal-100 bg-teal-50/50 p-4 font-mono text-sm text-teal-900 whitespace-pre-wrap">
              {v.transcription}
            </div>
            {hasSegments && (
              <div className="mt-4">
                <h4 className="font-semibold text-sm text-teal-800 mb-2">Speaker segments</h4>
                <div className="space-y-2">
                  {v.speaker_segments.map((segment, idx) => (
                    <div key={idx} className="text-xs text-teal-700">
                      <Badge variant="outline" className="mr-2 border-teal-300 text-teal-800">
                        Speaker {segment.speaker}
                      </Badge>
                      {segment.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {hasKw && (
        <Card className="border-teal-200 bg-white/80 backdrop-blur shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-teal-900 text-base">
              <TrendingUp className="w-5 h-5 text-teal-700" />
              Keyword analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="text-2xl font-bold text-blue-900">{v.keyword_analysis.total_words}</div>
                <div className="text-sm text-blue-700">Total words</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="text-2xl font-bold text-emerald-900">
                  {Object.keys(v.keyword_analysis.diagnostic_keywords || {}).length}
                </div>
                <div className="text-sm text-emerald-700">Diagnostic keywords</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-violet-50 border border-violet-100">
                <div className="text-2xl font-bold text-violet-900">{v.keyword_analysis.keyword_percentage}%</div>
                <div className="text-sm text-violet-700">Keyword density</div>
              </div>
            </div>

            {v.keyword_analysis.top_keywords && v.keyword_analysis.top_keywords.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-teal-800 mb-3">Top diagnostic keywords</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {v.keyword_analysis.top_keywords.map((kw, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg border border-teal-100 bg-white"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="outline" className="shrink-0 border-teal-200">
                          {kw.count}×
                        </Badge>
                        <span className="font-medium text-sm text-teal-900 truncate">{kw.word}</span>
                      </div>
                      <span className="text-xs text-teal-600 shrink-0">{kw.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {v.keyword_analysis.inter_word_frequency &&
              Object.keys(v.keyword_analysis.inter_word_frequency).length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-teal-800 mb-2">Symptom co-occurrence (within 10 words)</h4>
                  <div className="space-y-2">
                    {Object.entries(v.keyword_analysis.inter_word_frequency)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 10)
                      .map(([pair, count], idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100"
                        >
                          <span className="font-medium text-sm text-amber-950">{pair}</span>
                          <Badge className="bg-amber-200 text-amber-950">{count}×</Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {hasSent && (
        <Card className="border-teal-200 bg-white/80 backdrop-blur shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-teal-900 text-base">
              <Sparkles className="w-5 h-5 text-teal-700" />
              Sentiment &amp; emotional analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="text-center p-4 rounded-lg bg-teal-50 border border-teal-100">
                <Badge
                  className={
                    v.sentiment_analysis.overall_sentiment === "positive"
                      ? "bg-emerald-100 text-emerald-900"
                      : v.sentiment_analysis.overall_sentiment === "negative"
                        ? "bg-red-100 text-red-900"
                        : "bg-amber-100 text-amber-900"
                  }
                >
                  {String(v.sentiment_analysis.overall_sentiment || "").toUpperCase()}
                </Badge>
                <div className="text-sm text-teal-700 mt-2">Overall sentiment</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-teal-50 border border-teal-100">
                <div className="text-2xl font-bold text-teal-900">{v.sentiment_analysis.sentiment_score}</div>
                <div className="text-sm text-teal-700">Sentiment score</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-teal-50 border border-teal-100">
                <Badge
                  className={
                    v.sentiment_analysis.distress_level === "high"
                      ? "bg-red-500 text-white"
                      : v.sentiment_analysis.distress_level === "medium"
                        ? "bg-amber-500 text-white"
                        : "bg-emerald-600 text-white"
                  }
                >
                  {String(v.sentiment_analysis.distress_level || "").toUpperCase()}
                </Badge>
                <div className="text-sm text-teal-700 mt-2">Distress level</div>
              </div>
            </div>
            {v.sentiment_analysis.emotional_indicators &&
              v.sentiment_analysis.emotional_indicators.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-teal-800 mb-2">Emotional indicators</h4>
                  <div className="flex flex-wrap gap-2">
                    {v.sentiment_analysis.emotional_indicators.map((indicator, idx) => (
                      <Badge key={idx} variant="outline" className="border-teal-200 text-teal-800">
                        {indicator}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {hasSem && (
        <Card className="border-teal-200 bg-white/80 backdrop-blur shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-teal-900 text-base">Semantic analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {v.semantic_analysis.key_themes && (
              <div>
                <h4 className="font-semibold text-sm text-teal-800 mb-2">Key themes</h4>
                <div className="flex flex-wrap gap-2">
                  {v.semantic_analysis.key_themes.map((theme, idx) => (
                    <Badge key={idx} className="bg-teal-100 text-teal-900 hover:bg-teal-100">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {v.semantic_analysis.symptom_severity && (
                <div className="p-3 rounded-lg bg-teal-50 border border-teal-100">
                  <div className="text-xs text-teal-600">Symptom severity</div>
                  <div className="font-semibold text-teal-900">{v.semantic_analysis.symptom_severity}</div>
                </div>
              )}
              {v.semantic_analysis.functional_impact && (
                <div className="p-3 rounded-lg bg-teal-50 border border-teal-100">
                  <div className="text-xs text-teal-600">Functional impact</div>
                  <div className="font-semibold text-teal-900">{v.semantic_analysis.functional_impact}</div>
                </div>
              )}
              {v.semantic_analysis.temporal_patterns && (
                <div className="p-3 rounded-lg bg-teal-50 border border-teal-100">
                  <div className="text-xs text-teal-600">Temporal pattern</div>
                  <div className="font-semibold text-teal-900">{v.semantic_analysis.temporal_patterns}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {hasNotes && (
        <Card className="border-teal-200 bg-white/80 backdrop-blur shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-teal-900 text-base">
              <Stethoscope className="w-5 h-5 text-teal-700" />
              Physician notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-teal-100 bg-teal-50/50 p-4 text-sm text-teal-900 whitespace-pre-wrap">
              {v.physician_notes}
            </div>
          </CardContent>
        </Card>
      )}

      {hasComparison && (
        <Card className="border-teal-200 bg-white/80 backdrop-blur shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-teal-900 text-base">
                <GitCompare className="w-5 h-5 text-teal-700" />
                AI model comparison
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="border-teal-300 text-teal-800 shrink-0"
                onClick={() => setShowComparison((s) => !s)}
              >
                {showComparison ? "Hide" : "Show"} comparison
              </Button>
            </div>
          </CardHeader>
          {showComparison && (
            <CardContent>
              <div className="space-y-6">
                {v.ai_comparison.openai && !v.ai_comparison.errors?.openai && (
                  <div className="border border-blue-200 rounded-lg overflow-hidden">
                    <div className="bg-blue-100 px-4 py-3 border-b border-blue-200">
                      <h4 className="font-semibold text-blue-900">OpenAI GPT-4</h4>
                    </div>
                    <div className="p-5 bg-blue-50/30">
                      <div className="space-y-5">
                        {v.ai_comparison.openai.diagnostic?.suggested_diagnoses && (
                          <div>
                            <h5 className="font-semibold text-sm text-slate-600 mb-2 uppercase tracking-wide">
                              Diagnoses
                            </h5>
                            <div className="space-y-1 text-sm text-slate-700">
                              {v.ai_comparison.openai.diagnostic.suggested_diagnoses.map((dx, idx) => (
                                <div key={idx}>{dx}</div>
                              ))}
                            </div>
                          </div>
                        )}
                        {v.ai_comparison.openai.diagnostic?.recommended_tests && (
                          <div>
                            <h5 className="font-semibold text-sm text-slate-600 mb-2 uppercase tracking-wide">
                              Tests
                            </h5>
                            <div className="space-y-1 text-sm text-slate-700">
                              {v.ai_comparison.openai.diagnostic.recommended_tests.map((test, idx) => (
                                <div key={idx}>{test}</div>
                              ))}
                            </div>
                          </div>
                        )}
                        {v.ai_comparison.openai.diagnostic?.treatment_suggestions && (
                          <div>
                            <h5 className="font-semibold text-sm text-slate-600 mb-2 uppercase tracking-wide">
                              Treatment
                            </h5>
                            <div className="space-y-1 text-sm text-slate-700">
                              {v.ai_comparison.openai.diagnostic.treatment_suggestions.map((tx, idx) => (
                                <div key={idx}>{tx}</div>
                              ))}
                            </div>
                          </div>
                        )}
                        {v.ai_comparison.openai.diagnostic?.follow_up_recommendations && (
                          <div>
                            <h5 className="font-semibold text-sm text-slate-600 mb-2 uppercase tracking-wide">
                              Follow-up
                            </h5>
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {v.ai_comparison.openai.diagnostic.follow_up_recommendations}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {v.ai_comparison.ollama && !v.ai_comparison.errors?.ollama && (
                  <div className="border border-emerald-200 rounded-lg overflow-hidden">
                    <div className="bg-emerald-100 px-4 py-3 border-b border-emerald-200">
                      <h4 className="font-semibold text-emerald-900">Ollama Llama2</h4>
                    </div>
                    <div className="p-5 bg-emerald-50/30">
                      <div className="space-y-5">
                        {v.ai_comparison.ollama.diagnostic?.suggested_diagnoses && (
                          <div>
                            <h5 className="font-semibold text-sm text-slate-600 mb-2 uppercase tracking-wide">
                              Diagnoses
                            </h5>
                            <div className="space-y-1 text-sm text-slate-700">
                              {v.ai_comparison.ollama.diagnostic.suggested_diagnoses.map((dx, idx) => (
                                <div key={idx}>{typeof dx === "string" ? dx : dx.name || JSON.stringify(dx)}</div>
                              ))}
                            </div>
                          </div>
                        )}
                        {v.ai_comparison.ollama.diagnostic?.recommended_tests && (
                          <div>
                            <h5 className="font-semibold text-sm text-slate-600 mb-2 uppercase tracking-wide">
                              Tests
                            </h5>
                            <div className="space-y-1 text-sm text-slate-700">
                              {v.ai_comparison.ollama.diagnostic.recommended_tests.map((test, idx) => (
                                <div key={idx}>
                                  {typeof test === "string" ? test : test.name || JSON.stringify(test)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {v.ai_comparison.ollama.diagnostic?.treatment_suggestions && (
                          <div>
                            <h5 className="font-semibold text-sm text-slate-600 mb-2 uppercase tracking-wide">
                              Treatment
                            </h5>
                            <div className="space-y-1 text-sm text-slate-700">
                              {v.ai_comparison.ollama.diagnostic.treatment_suggestions.map((tx, idx) => (
                                <div key={idx}>{typeof tx === "string" ? tx : tx.name || JSON.stringify(tx)}</div>
                              ))}
                            </div>
                          </div>
                        )}
                        {v.ai_comparison.ollama.diagnostic?.follow_up_recommendations && (
                          <div>
                            <h5 className="font-semibold text-sm text-slate-600 mb-2 uppercase tracking-wide">
                              Follow-up
                            </h5>
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {v.ai_comparison.ollama.diagnostic.follow_up_recommendations}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {v.ai_comparison.errors && Object.keys(v.ai_comparison.errors).length > 0 && (
                  <div className="border border-red-200 rounded-lg overflow-hidden">
                    <div className="bg-red-100 px-4 py-3 border-b border-red-200">
                      <h4 className="font-semibold text-red-900">Errors</h4>
                    </div>
                    <div className="p-4 bg-red-50">
                      {Object.entries(v.ai_comparison.errors).map(([model, error]) => (
                        <div key={model} className="mb-2">
                          <span className="font-semibold text-sm capitalize">{model}:</span>
                          <span className="text-sm text-slate-700 ml-2">{error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-teal-200 bg-teal-50/80 p-4">
                  <p className="text-sm text-teal-800">
                    <strong className="font-semibold">Note:</strong> The main assessment in the AI diagnostic tab uses
                    consensus from both models. This section shows individual model outputs for transparency.
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
