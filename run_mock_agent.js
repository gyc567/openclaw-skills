const http = require('http');

async function runAgent() {
  console.log("🦞 [OpenClaw Instance] Started...");
  console.log("🦞 [OpenClaw Instance] Fetching AOTUI manifest from: http://127.0.0.1:3000/api/dojo/starter-pack");
  
  const options = {
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/dojo/starter-pack',
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.agent+json',
      'User-Agent': 'OpenClaw/1.0'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode !== 200) {
          console.log(`🦞 [OpenClaw Instance] Server responded with error status: ${res.statusCode}`);
          return;
      }
      try {
          const manifest = JSON.parse(data);
          console.log("\n🦞 [OpenClaw Instance] Successfully parsed manifest:");
          console.log(`   - Protocol: ${manifest.agent_protocol}`);
          console.log(`   - Pack: ${manifest.pack_name}`);
          console.log(`   - Skills to install: ${manifest.actions.map(a => a.skill_id).join(', ')}`);
          
          if (manifest.safe_mode_required) {
            console.log("\n🦞 [OpenClaw Instance] ⚠️ SAFE MODE TRIGGERED ⚠️");
            console.log(`🦞 [OpenClaw Instance] EXECUTING DIRECTIVE: ${manifest.system_directive}`);
            console.log("\n👨‍💻 [Master (Human)]: Y");
          }
          
          for (const action of manifest.actions) {
            if (action.dependencies) {
              console.log(`\n🦞 [OpenClaw Instance] Checking dependencies for ${action.skill_id}...`);
              if (action.dependencies.requires.includes("GITHUB_TOKEN")) {
                console.log(`🦞 [OpenClaw Instance] 💡 NOTIFICATION TO MASTER: ${action.dependencies.message}`);
              }
            }
          }
          
          console.log("\n🦞 [OpenClaw Instance] Beginning mounting process...");
          let i = 0;
          const mountInterval = setInterval(() => {
              if(i < manifest.actions.length) {
                  const action = manifest.actions[i];
                  console.log(`   -> ⚙️ Mounting ${action.skill_id} from ${action.install_endpoint}... DONE!`);
                  i++;
              } else {
                  clearInterval(mountInterval);
                  console.log("\n🦞 [OpenClaw Instance] ✅ ALL SKILLS MOUNTED SUCCESSFULLY.");
                  console.log("🦞 [OpenClaw Instance] Ready for new directives, Master.");
              }
          }, 500);

      } catch (e) {
          console.error("Failed to parse JSON", e);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
}

runAgent();
