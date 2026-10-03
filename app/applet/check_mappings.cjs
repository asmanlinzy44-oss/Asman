const https = require("https");

function getFolderMappings(subjectName, folderId) {
  https.get(`https://drive.google.com/drive/folders/${folderId}`, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }, (res) => {
    let data = "";
    res.on("data", c => data += c);
    res.on("end", () => {
      console.log(`\n================== ${subjectName} Mappings (${folderId}) ==================`);
      // Google drive page has rows: data-id="..." with folder names
      const rows = [...data.matchAll(/data-id="([a-zA-Z0-9_-]{25,45})"/g)].map(m => m[1]);
      console.log("All data-ids found in page:", [...new Set(rows)]);

      // Let us search for occurrences of each title and find the surrounding id
      const folderNames = [
        "FWC Papers", "Moratuwa Papers", "Past Papers", "Practical Book",
        "Resource books", "Support Seminar Papers", "Teacher",
        "Theory", "2000+"
      ];

      folderNames.forEach(fn => {
        let pos = data.indexOf(fn);
        if (pos !== -1) {
          const slice = data.substring(Math.max(0, pos - 600), Math.min(data.length, pos + 600));
          const idMatches = [...slice.matchAll(/[1][a-zA-Z0-9_-]{32}/g)].map(m => m[0]);
          const candidateIds = idMatches.filter(id => id !== folderId && !id.includes("18h18v") && !id.includes("120-240v"));
          console.log(`"${fn}" -> Candidates: ${[...new Set(candidateIds)].join(", ")}`);
        }
      });
    });
  });
}

getFolderMappings("Biology", "19jJOxshaK3FpEeEd9caiwEVT79eeMYz2");
getFolderMappings("Chemistry", "1tL7N0zTjqhbG3jWDBQn9VspcPgglVMsD");
getFolderMappings("Physics", "1nhSw8LLOjq_x5s5YORyBZCBy1QsIPmB8");
