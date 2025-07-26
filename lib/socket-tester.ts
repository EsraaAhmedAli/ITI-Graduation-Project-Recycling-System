
// lib/socket-tester.ts - Different authentication strategies
import { io, Socket } from "socket.io-client";

export const testSocketConnections = (token: string) => {
  console.log("🧪 Testing different socket authentication methods...");
  
  const configs = [
    {
      name: "Method 1: auth.token",
      config: {
        auth: { token },
        transports: ["websocket", "polling"],
        withCredentials: true,
      }
    },
    {
      name: "Method 2: auth.authorization Bearer",
      config: {
        auth: { authorization: `Bearer ${token}` },
        transports: ["websocket", "polling"],
        withCredentials: true,
      }
    },
    {
      name: "Method 3: query.token",
      config: {
        query: { token },
        transports: ["websocket", "polling"],
        withCredentials: true,
      }
    },
    {
      name: "Method 4: extraHeaders",
      config: {
        extraHeaders: {
          Authorization: `Bearer ${token}`
        },
        transports: ["websocket", "polling"],
        withCredentials: true,
      }
    },
    {
      name: "Method 5: auth.jwt",
      config: {
        auth: { jwt: token },
        transports: ["websocket", "polling"],
        withCredentials: true,
      }
    }
  ];

  configs.forEach((testConfig, index) => {
    setTimeout(() => {
      console.log(`\n🔬 Testing ${testConfig.name}...`);
      
      const testSocket = io("http://localhost:5000", testConfig.config);
      
      const timeout = setTimeout(() => {
        console.log(`⏰ ${testConfig.name} - Connection timeout`);
        testSocket.disconnect();
      }, 5000);

      testSocket.on("connect", () => {
        console.log(`✅ ${testConfig.name} - Connected successfully!`);
        console.log(`Socket ID: ${testSocket.id}`);
        clearTimeout(timeout);
        
        // Test sending a message
        testSocket.emit("test", `Hello from ${testConfig.name}`);
        
        // Disconnect after successful test
        setTimeout(() => {
          testSocket.disconnect();
        }, 2000);
      });

      testSocket.on("connect_error", (err) => {
        console.error(`❌ ${testConfig.name} - Connection failed:`, err.message);
        clearTimeout(timeout);
        testSocket.disconnect();
      });

      testSocket.on("authenticated", () => {
        console.log(`🎉 ${testConfig.name} - Authentication successful!`);
      });

      testSocket.on("unauthorized", (error) => {
        console.error(`🚫 ${testConfig.name} - Authentication failed:`, error);
      });
      
    }, index * 1000); // Stagger the tests
  });
};
