import json

with open('words.json', 'r', encoding="utf-8") as f:
    words = json.load(f)

with open('rules.json', 'r', encoding="utf-8") as f:
    rules = json.load(f)

word_count = len(words)
results = {"total_word_count": word_count}

for grp in rules:
    val = len([k for k, v in words.items() if v.get('group') == grp])
    results[grp] = val

with open('count.json', 'w', encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=4)
