/**
 * Compact multimodal summary from face / audio / gait JSONL-style rows for LLM prompts.
 * Keeps token use reasonable vs dumping raw records.
 */

function labelEmo(key) {
  const s = String(key).replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/**
 * @param {object[]} face
 * @param {object[]} audio
 * @param {object[]} gait
 * @returns {string}
 */
export function summarizeJsonlForLLM(face, audio, gait) {
  const parts = [];

  if (Array.isArray(face) && face.length) {
    const windows = face.filter((r) => r.type === "window");
    const summary = face.find((r) => r.type === "summary");
    const anyInvalid = face.some((r) => r.valid === false);
    let emotionPct = {};
    if (summary?.features?.emotion_pct) {
      emotionPct = { ...summary.features.emotion_pct };
    } else if (windows.length) {
      const emotionCounts = {};
      windows.forEach((w) => {
        const ec = w.features?.emotion_counts || {};
        Object.entries(ec).forEach(([k, v]) => {
          emotionCounts[k] = (emotionCounts[k] || 0) + v;
        });
      });
      const total = Object.values(emotionCounts).reduce((a, v) => a + v, 0) || 1;
      Object.entries(emotionCounts).forEach(([k, v]) => {
        emotionPct[k] = +((v / total) * 100).toFixed(1);
      });
    }
    const topEmo = Object.entries(emotionPct)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k, v]) => `${labelEmo(k)} ${v}%`)
      .join(", ");
    const events = face
      .filter((r) => r.type === "event")
      .map((r) => `${r.features?.event ?? "event"}@${r.t != null ? `${r.t}s` : "?"}`)
      .slice(0, 8);
    const confs = windows.map((w) => w.confidence).filter((c) => c != null);
    const avgConf =
      confs.length > 0 ? (confs.reduce((a, b) => a + b, 0) / confs.length).toFixed(2) : null;
    parts.push(
      `Face (expression): ${topEmo || "no emotion aggregates"}. ` +
        `Avg window confidence ${avgConf ?? "n/a"}. ` +
        `Validity flag issues: ${anyInvalid ? "yes (some windows marked invalid)" : "none"}.` +
        (events.length ? ` Events: ${events.join("; ")}.` : "")
    );
  }

  if (Array.isArray(audio) && audio.length) {
    const windows = audio.filter((r) => r.type === "window");
    const summary = audio.find((r) => r.type === "summary");
    const pols = windows.map((w) => w.features?.sentiment?.polarity).filter((p) => p != null);
    const meanPol =
      pols.length > 0
        ? (pols.reduce((a, b) => a + b, 0) / pols.length).toFixed(3)
        : null;
    const kwMap = {};
    windows.forEach((w) => {
      (w.features?.top_words || []).forEach(([word, count]) => {
        kwMap[word] = (kwMap[word] || 0) + count;
      });
    });
    const topKw = Object.entries(kwMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([w, c]) => `${w}(${c})`)
      .join(", ");
    const topicMap = {};
    windows.forEach((w) => {
      (w.features?.topics || []).forEach(([topic, score]) => {
        if (!topicMap[topic]) topicMap[topic] = [];
        topicMap[topic].push(score);
      });
    });
    if (!Object.keys(topicMap).length && summary?.features?.topics) {
      summary.features.topics.forEach(([t, s]) => {
        topicMap[t] = [s];
      });
    }
    const topTopics = Object.entries(topicMap)
      .map(([topic, scores]) => ({
        topic,
        avg: scores.reduce((x, y) => x + y, 0) / scores.length,
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 6)
      .map((r) => `${r.topic.replace(/_/g, " ")} ${(r.avg * 100).toFixed(0)}%`)
      .join(", ");
    const summaryPol = summary?.features?.sentiment?.polarity;
    const diagPct = summary?.features?.diagnostic_terms?.diagnostic_term_pct;
    parts.push(
      `Audio / language (transcript-derived windows): mean sentiment polarity ${meanPol ?? "n/a"} (windows). ` +
        (summaryPol != null ? `Summary polarity ${summaryPol}. ` : "") +
        (diagPct != null ? `Approx. diagnostic-term density ${(diagPct * 100).toFixed(1)}%. ` : "") +
        `Top words: ${topKw || "n/a"}. ` +
        `Topic emphasis: ${topTopics || "n/a"}.`
    );
  }

  if (Array.isArray(gait) && gait.length) {
    const summary = gait.find((r) => r.type === "summary");
    const feats = summary?.features || {};
    const events = gait
      .filter((r) => r.type === "event")
      .map((r) => `${r.features?.event ?? "event"}@${r.t != null ? `${r.t}s` : "?"}`)
      .slice(0, 8);
    const anyInvalid = gait.some((r) => r.valid === false);
    parts.push(
      `Gait / motion: avg speed ${feats.avg_speed_mps ?? "n/a"} m/s, symmetry ${feats.avg_symmetry != null ? (feats.avg_symmetry * 100).toFixed(0) + "%" : "n/a"}, stability ${feats.avg_stability != null ? (feats.avg_stability * 100).toFixed(0) + "%" : "n/a"}. ` +
        `Validity issues: ${anyInvalid ? "yes" : "none"}.` +
        (summary?.notes ? ` Notes: ${summary.notes}.` : "") +
        (events.length ? ` Events: ${events.join("; ")}.` : "")
    );
  }

  if (!parts.length) return "";

  return (
    "Multimodal sensor / NLP pipeline summary (JSONL-derived; use as adjunct to transcript and vitals):\n" +
    parts.map((p) => `- ${p}`).join("\n")
  );
}

/**
 * @param {object} visitData — may include multimodal_summary (string) or multimodal_jsonl: { face, audio, gait }
 * @returns {string} text to append to LLM user prompt, or ""
 */
export function buildMultimodalPromptAppendix(visitData) {
  if (typeof visitData !== "object" || visitData == null) return "";

  if (typeof visitData.multimodal_summary === "string" && visitData.multimodal_summary.trim()) {
    return (
      "\n\n" +
      "Multimodal summary (precomputed):\n" +
      visitData.multimodal_summary.trim()
    );
  }

  const m = visitData.multimodal_jsonl;
  if (
    m &&
    Array.isArray(m.face) &&
    Array.isArray(m.audio) &&
    Array.isArray(m.gait)
  ) {
    const block = summarizeJsonlForLLM(m.face, m.audio, m.gait);
    return block ? `\n\n${block}` : "";
  }

  return "";
}
