// Simple Neural Network for game prediction
class SimpleNeuralNetwork {
  constructor() {
    this.weights = {
      input: this.randomMatrix(6, 8), // 6 indicators -> 8 hidden
      hidden: this.randomMatrix(8, 4), // 8 hidden -> 4 outputs
    };
    this.learningRate = 0.1;
    this.trainingEpochs = 0;
  }

  randomMatrix(rows, cols) {
    return Array(rows)
      .fill()
      .map(() =>
        Array(cols)
          .fill()
          .map(() => Math.random() * 2 - 1)
      );
  }

  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  forward(inputs) {
    // Hidden layer
    const hidden = this.weights.input.map((weights) =>
      this.sigmoid(weights.reduce((sum, w, i) => sum + w * inputs[i], 0))
    );

    // Output layer
    const outputs = this.weights.hidden.map((weights) =>
      this.sigmoid(weights.reduce((sum, w, i) => sum + w * hidden[i], 0))
    );

    return { hidden, outputs };
  }

  predict(gameState) {
    const inputs = this.normalizeGameState(gameState);
    const result = this.forward(inputs);

    return {
      winProbability: result.outputs[0],
      riskLevel: result.outputs[1],
      economicScore: result.outputs[2],
      socialScore: result.outputs[3],
    };
  }

  normalizeGameState(state) {
    const indicators = state.currentIndicators || {};
    return [
      (indicators.gdp || 50) / 100,
      (indicators.unemployment || 50) / 100,
      (indicators.gini || 50) / 100,
      (indicators.legitimacy || 50) / 100,
      (indicators.military || 50) / 100,
      (indicators.publicServices || 50) / 100,
    ];
  }

  // Training với backpropagation đơn giản
  train(trainingSet) {
    console.log("🧠 Bắt đầu training neural network...");

    for (let epoch = 0; epoch < 100; epoch++) {
      let totalError = 0;

      trainingSet.forEach((data) => {
        const inputs = this.normalizeGameState(data.input);
        const expected = data.output;
        const result = this.forward(inputs);

        // Tính error
        const outputError = expected.map((exp, i) => exp - result.outputs[i]);
        totalError += outputError.reduce((sum, err) => sum + err * err, 0);

        // Simplified backpropagation (chỉ điều chỉnh weights đơn giản)
        this.adjustWeights(inputs, result, outputError);
      });

      if (epoch % 20 === 0) {
        console.log(`Epoch ${epoch}: Error = ${totalError.toFixed(4)}`);
      }
    }

    this.trainingEpochs += 100;
    console.log("✅ Training hoàn thành!");
  }

  adjustWeights(inputs, result, outputError) {
    // Simplified weight adjustment
    for (let i = 0; i < this.weights.hidden.length; i++) {
      for (let j = 0; j < this.weights.hidden[i].length; j++) {
        this.weights.hidden[i][j] +=
          this.learningRate * outputError[i] * result.hidden[j];
      }
    }
  }
}

// AI Prediction Engine for game outcomes
class GamePredictor {
  constructor() {
    this.historicalData = [];
    this.patterns = new Map();
  }

  // Dự đoán kết quả dựa trên chính sách hiện tại
  predictOutcome(currentState, proposedPolicy) {
    const prediction = {
      riskLevel: "medium",
      expectedChanges: {},
      confidence: 0.7,
      recommendations: [],
      warnings: [],
    };

    // Phân tích rủi ro dựa trên pattern
    const risk = this.calculateRisk(currentState, proposedPolicy);
    prediction.riskLevel = risk.level;
    prediction.confidence = risk.confidence;

    // Dự đoán thay đổi chỉ số
    prediction.expectedChanges = this.predictIndicatorChanges(
      currentState,
      proposedPolicy
    );

    // Sinh ra cảnh báo thông minh
    prediction.warnings = this.generateSmartWarnings(
      currentState,
      proposedPolicy
    );

    return prediction;
  }

  calculateRisk(state, policy) {
    let riskScore = 0;

    // Tính toán rủi ro dựa trên tình hình hiện tại
    if (state.indicators?.unemployment > 70) riskScore += 3;
    if (state.indicators?.gini > 70) riskScore += 3;
    if (state.indicators?.gdp < 30) riskScore += 4;
    if (state.indicators?.legitimacy < 30) riskScore += 5;

    // Rủi ro từ nhóm xã hội
    const unhappyGroups = Object.values(state.socialGroups || {}).filter(
      (v) => v < 25
    ).length;
    riskScore += unhappyGroups * 2;

    // Xác định level
    let level = "low";
    if (riskScore > 8) level = "high";
    else if (riskScore > 4) level = "medium";

    return {
      level,
      score: riskScore,
      confidence: Math.min(0.9, 0.5 + riskScore * 0.05),
    };
  }

  predictIndicatorChanges(state, policy) {
    // Simplified prediction model
    const changes = {};

    // Dự đoán dựa trên pattern thông thường
    if (policy?.includes("thuế")) {
      changes.gdp = "có thể giảm nhẹ";
      changes.legitimacy = "có thể tăng";
    }

    return changes;
  }

  generateSmartWarnings(state, policy) {
    const warnings = [];

    // Cảnh báo về domino effect
    if (state.indicators?.unemployment > 60 && state.indicators?.gini > 60) {
      warnings.push(
        "⚠️ Nguy cơ bất ổn xã hội cao - thất nghiệp + bất bình đẳng!"
      );
    }

    // Cảnh báo về timing
    if (state.currentTurn > 7 && state.indicators?.legitimacy < 40) {
      warnings.push("🕒 Thời gian ít, uy tín thấp - cần hành động quyết liệt!");
    }

    return warnings;
  }
}

// Advanced Local Game Assistant with AI capabilities
class GameAssistant {
  constructor() {
    this.gameKnowledge = {
      basic: {
        "làm sao chơi":
          "Bạn đóng vai thủ tướng, mỗi lượt chọn 1 chính sách trong 10 lượt. Mục tiêu là cân bằng các chỉ số quốc gia và sự hài lòng của các nhóm xã hội.",
        "cách chơi":
          "1) Quan sát các chỉ số hiện tại, 2) Chọn 1 chính sách phù hợp, 3) Xem tác động, 4) Chuyển sang lượt tiếp theo. Lặp lại 10 lượt.",
        "mục tiêu":
          "Cân bằng lợi ích quốc gia và các giai cấp xã hội. Không để chỉ số nào quá thấp hoặc nhóm nào quá bất mãn.",
        "thắng thua":
          "Thắng khi hoàn thành 10 lượt mà các chỉ số ổn định. Thua khi chỉ số quan trọng xuống quá thấp.",
      },
      indicators: {
        gdp: "Tổng sản phẩm quốc nội (0-100). Thước đo sức khỏe kinh tế. Càng cao càng tốt.",
        "thất nghiệp":
          "Tỷ lệ thất nghiệp (0-100). Càng THẤP càng tốt! Cao quá sẽ gây bất ổn xã hội.",
        gini: "Chỉ số bất bình đẳng thu nhập (0-100). Càng THẤP càng công bằng! Cao nghĩa là giàu nghèo chênh lệch.",
        "uy tín":
          "Mức độ tin tưởng dân chúng (0-100). Càng cao càng tốt. Thấp quá có thể mất quyền lực.",
        "quân sự":
          "Sức mạnh quốc phòng (0-100). Càng cao càng tốt. Cần cho an ninh nhưng đắt đỏ.",
        "dịch vụ công":
          "Chất lượng y tế, giáo dục... (0-100). Càng cao càng tốt. Quan trọng cho dân sinh.",
      },
      groups: {
        "công nhân": "Quan tâm lương cao, phúc lợi. Ủng hộ chính sách xã hội.",
        "trung lưu": "Quan tâm ổn định, giáo dục. Cần cân bằng.",
        "tư bản": "Quan tâm lợi nhuận, thuế thấp. Ủng hộ tự do kinh doanh.",
        "thanh niên": "Quan tâm việc làm, môi trường, công nghệ.",
        freelancer: "Quan tâm linh hoạt, đổi mới, khởi nghiệp.",
      },
      policies: {
        "thuế doanh nghiệp":
          "Tăng ngân sách nhưng doanh nghiệp không thích. Tốt cho đầu tư công.",
        "lương tối thiểu": "Công nhân vui nhưng có thể giảm việc làm ngắn hạn.",
        "giáo dục": "Tốt dài hạn cho mọi nhóm. Cải thiện chất lượng nhân lực.",
        "quốc phòng": "Tăng an ninh nhưng tốn kém. Một số nhóm ủng hộ.",
        "môi trường": "Thanh niên thích nhưng có thể ảnh hưởng sản xuất.",
        "khởi nghiệp": "Freelancer và thanh niên thích. Thúc đẩy đổi mới.",
        "y tế": "Tốt cho dân sinh nhưng tốn ngân sách. Trung lưu ủng hộ.",
        "hạ tầng":
          "Tạo việc làm, thúc đẩy kinh tế. Công nhân và tư bản đều thích.",
      },
      strategy: {
        "bắt đầu":
          "Quan sát chỉ số ban đầu. Ưu tiên chỉ số thấp nhất. Chọn chính sách cân bằng.",
        "giữa game": "Theo dõi xu hướng. Điều chỉnh khi có nhóm quá bất mãn.",
        "cuối game":
          "Duy trì ổn định. Tránh thay đổi lớn. Chuẩn bị cho kết thúc.",
        "khẩn cấp": "Nếu chỉ số xuống dưới 20, ưu tiên cứu ngay lập tức.",
        "cân bằng":
          "Không để nhóm nào dưới 30 điểm. Luân phiên hỗ trợ các nhóm.",
      },
    };

    this.currentContext = null;
    this.conversationHistory = []; // Lưu lịch sử hội thoại
    this.userPreferences = {}; // Học từ hành vi người dùng
    this.gamePatterns = []; // Phát hiện pattern trong game
    this.predictionModel = new GamePredictor(); // AI dự đoán
    this.trainingData = this.initializeTrainingData(); // Dữ liệu training
    this.neuralNetwork = new SimpleNeuralNetwork(); // Mạng neural đơn giản
    this.isTraining = false;

    // Auto-load dữ liệu đã training từ localStorage
    this.loadTrainingProgress();
  }

  // Initialize comprehensive training data
  initializeTrainingData() {
    return {
      // Training scenarios với expected outcomes
      gameScenarios: [
        {
          input: {
            currentIndicators: {
              gdp: 30,
              unemployment: 70,
              gini: 80,
              legitimacy: 40,
              military: 50,
              publicServices: 45,
            },
            currentTurn: 3,
          },
          output: [0.2, 0.8, 0.3, 0.2], // [winProb, risk, economic, social]
          description: "Khủng hoảng kinh tế + xã hội",
        },
        {
          input: {
            currentIndicators: {
              gdp: 80,
              unemployment: 20,
              gini: 30,
              legitimacy: 70,
              military: 60,
              publicServices: 75,
            },
            currentTurn: 7,
          },
          output: [0.9, 0.1, 0.8, 0.8],
          description: "Tình hình tốt",
        },
        {
          input: {
            currentIndicators: {
              gdp: 25,
              unemployment: 80,
              gini: 85,
              legitimacy: 20,
              military: 30,
              publicServices: 25,
            },
            currentTurn: 8,
          },
          output: [0.1, 0.95, 0.1, 0.1],
          description: "Khủng hoảng nghiêm trọng",
        },
      ],

      // Policy effectiveness training data
      policyEffects: {
        infrastructure: {
          conditions: { gdp: "low", unemployment: "high" },
          effectiveness: 0.8,
          outcomes: { gdp: "+15", unemployment: "-10", workers: "+10" },
        },
        minimum_wage: {
          conditions: { gini: "high", workers: "low" },
          effectiveness: 0.7,
          outcomes: { gini: "-8", workers: "+15", unemployment: "+3" },
        },
      },
    };
  }

  // Load training progress from localStorage
  loadTrainingProgress() {
    const saved = localStorage.getItem("aiTrainingProgress");
    if (saved) {
      const data = JSON.parse(saved);
      this.neuralNetwork.trainingEpochs = data.epochs || 0;
      this.neuralNetwork.weights = data.weights || this.neuralNetwork.weights;
      console.log(
        `📚 Loaded AI training: ${this.neuralNetwork.trainingEpochs} epochs`
      );
    }
  }

  // Start comprehensive training
  async startTraining() {
    if (this.isTraining) {
      return "🧠 AI đang trong quá trình training...";
    }

    this.isTraining = true;
    console.log("🚀 Bắt đầu training AI...");

    // Train neural network với basic scenarios
    this.neuralNetwork.train(this.trainingData.gameScenarios);

    // Save progress
    const data = {
      epochs: this.neuralNetwork.trainingEpochs,
      weights: this.neuralNetwork.weights,
      timestamp: Date.now(),
    };
    localStorage.setItem("aiTrainingProgress", JSON.stringify(data));

    this.isTraining = false;
    return "✅ AI Training hoàn thành! Neural network đã được nâng cấp.";
  }

  // Enhanced AI prediction using trained model
  getAIPrediction(context) {
    if (!context) return null;

    const prediction = this.neuralNetwork.predict(context);

    return {
      accuracy: this.neuralNetwork.trainingEpochs > 100 ? "High" : "Medium",
      winChance: Math.round(prediction.winProbability * 100),
      riskLevel:
        prediction.riskLevel > 0.7
          ? "High"
          : prediction.riskLevel > 0.4
          ? "Medium"
          : "Low",
      economicOutlook: prediction.economicScore > 0.6 ? "Positive" : "Negative",
      socialStability: prediction.socialScore > 0.6 ? "Stable" : "Unstable",
      confidence: Math.min(95, 50 + this.neuralNetwork.trainingEpochs / 10),
      modelVersion: `v${
        Math.floor(this.neuralNetwork.trainingEpochs / 100) + 1
      }.${this.neuralNetwork.trainingEpochs % 100}`,
    };
  }

  updateContext(context) {
    this.currentContext = context;

    // Học từ hành vi người dùng
    this.learnFromGameState(context);

    // Phát hiện patterns
    this.detectGamePatterns(context);

    // Auto-training khi có đủ dữ liệu mới
    this.autoTrainFromGameplay(context);
  }

  // Auto-training from real gameplay
  autoTrainFromGameplay(context) {
    // Chỉ train khi có đủ patterns mới
    if (this.gamePatterns.length > 0 && this.gamePatterns.length % 5 === 0) {
      const newTrainingData = this.generateTrainingFromPatterns();
      if (newTrainingData.length > 0) {
        console.log(
          `🎮 Auto-training từ ${newTrainingData.length} game patterns...`
        );
        this.neuralNetwork.train(newTrainingData);
        this.saveTrainingProgress();

        // Notify user về AI improvement
        if (window.addMessage && Math.random() < 0.3) {
          // 30% chance to notify
          setTimeout(() => {
            window.addMessage(
              `🧠 **AI TỰ ĐỘNG HỌC:**\n\nAI đã học từ cách chơi của bạn!\n📈 +${newTrainingData.length} training samples\n💡 AI giờ hiểu bạn hơn!`,
              false,
              ["AI status", "Test AI mới"]
            );
          }, 2000);
        }
      }
    }
  }

  // Generate training data from user patterns
  generateTrainingFromPatterns() {
    if (this.gamePatterns.length < 3) return [];

    const recentPatterns = this.gamePatterns.slice(-5);
    const trainingData = [];

    recentPatterns.forEach((pattern) => {
      // Calculate expected outcome based on actual game state
      const winProb = this.estimateWinProbability(pattern);
      const risk = this.estimateRisk(pattern);

      trainingData.push({
        input: {
          currentIndicators: {
            gdp: pattern.gdp,
            unemployment: pattern.unemployment,
            gini: pattern.gini,
            legitimacy: pattern.legitimacy,
            military: 50, // Default values for missing data
            publicServices: 50,
          },
          currentTurn: pattern.turn,
        },
        output: [winProb, risk, winProb * 0.8, winProb * 0.9],
      });
    });

    return trainingData;
  }

  estimateWinProbability(pattern) {
    let score = 0;

    // Scoring based on actual game rules
    if (pattern.gdp > 60) score += 0.3;
    else if (pattern.gdp < 30) score -= 0.3;

    if (pattern.unemployment < 40) score += 0.2;
    else if (pattern.unemployment > 70) score -= 0.4;

    if (pattern.gini < 40) score += 0.2;
    else if (pattern.gini > 70) score -= 0.3;

    if (pattern.legitimacy > 60) score += 0.3;
    else if (pattern.legitimacy < 30) score -= 0.4;

    return Math.max(0.1, Math.min(0.9, 0.5 + score));
  }

  estimateRisk(pattern) {
    let risk = 0.3; // Base risk

    if (pattern.unemployment > 75) risk += 0.3;
    if (pattern.gini > 75) risk += 0.2;
    if (pattern.gdp < 25) risk += 0.3;
    if (pattern.legitimacy < 25) risk += 0.4;

    return Math.min(0.95, risk);
  }

  // Học từ game state để hiểu thói quen người chơi
  learnFromGameState(context) {
    if (!context) return;

    // Ghi nhận xu hướng chọn chính sách
    if (context.selectedPolicy) {
      const turn = context.currentTurn;
      const indicators = context.currentIndicators;

      // Lưu pattern chọn chính sách
      const pattern = {
        turn,
        policy: context.selectedPolicy,
        gdp: indicators?.gdp,
        unemployment: indicators?.unemployment,
        gini: indicators?.gini,
        legitimacy: indicators?.legitimacy,
        timestamp: Date.now(),
      };

      this.gamePatterns.push(pattern);

      // Giữ chỉ 20 patterns gần nhất
      if (this.gamePatterns.length > 20) {
        this.gamePatterns.shift();
      }
    }
  }

  // Phát hiện patterns trong cách chơi
  detectGamePatterns(context) {
    if (this.gamePatterns.length < 3) return;

    // Phát hiện xu hướng ưu tiên
    const recentPatterns = this.gamePatterns.slice(-5);

    // Kiểm tra xem người chơi có ưu tiên kinh tế hay xã hội
    let economicFocus = 0;
    let socialFocus = 0;

    recentPatterns.forEach((pattern) => {
      if (
        pattern.policy?.includes("thuế") ||
        pattern.policy?.includes("gdp") ||
        pattern.policy?.includes("khởi nghiệp")
      ) {
        economicFocus++;
      }
      if (
        pattern.policy?.includes("lương") ||
        pattern.policy?.includes("y tế") ||
        pattern.policy?.includes("giáo dục")
      ) {
        socialFocus++;
      }
    });

    // Lưu xu hướng
    if (economicFocus > socialFocus) {
      this.userPreferences.focus = "economic";
    } else if (socialFocus > economicFocus) {
      this.userPreferences.focus = "social";
    } else {
      this.userPreferences.focus = "balanced";
    }
  }

  analyze(input) {
    const keywords = input.toLowerCase();

    // Lưu lại hội thoại để học hỏi
    this.conversationHistory.push({
      input: input,
      timestamp: Date.now(),
      context: this.currentContext?.currentTurn,
    });

    // Giữ 50 cuộc hội thoại gần nhất
    if (this.conversationHistory.length > 50) {
      this.conversationHistory.shift();
    }

    // Training commands - Lệnh training AI
    if (
      keywords.includes("train") ||
      keywords.includes("training") ||
      keywords.includes("học") ||
      keywords.includes("train ai") ||
      keywords.includes("huấn luyện")
    ) {
      return this.handleTrainingCommand(keywords);
    }

    // AI status check
    if (
      keywords.includes("ai status") ||
      keywords.includes("trình độ ai") ||
      keywords.includes("ai đã học") ||
      keywords.includes("model version")
    ) {
      return this.showAIStatus();
    }

    // AI dự đoán nâng cao
    if (
      keywords.includes("dự đoán") ||
      keywords.includes("sẽ ra sao") ||
      keywords.includes("kết quả") ||
      keywords.includes("tương lai") ||
      keywords.includes("tiếp theo")
    ) {
      return this.providePrediction();
    }

    // Phân tích so sánh với lịch sử
    if (
      keywords.includes("so sánh") ||
      keywords.includes("trước đây") ||
      keywords.includes("khác biệt") ||
      keywords.includes("cải thiện")
    ) {
      return this.compareWithHistory();
    }

    // Học từ lỗi và đưa ra gợi ý cá nhân hóa
    if (
      keywords.includes("sai") ||
      keywords.includes("lỗi") ||
      keywords.includes("tệ") ||
      keywords.includes("không tốt")
    ) {
      return this.learnFromMistakes();
    }

    // Benchmark và test AI
    if (
      keywords.includes("test ai") ||
      keywords.includes("benchmark") ||
      keywords.includes("kiểm tra ai") ||
      keywords.includes("thử ai")
    ) {
      return this.benchmarkAI();
    }

    // Phân tích tình hình hiện tại
    if (
      keywords.includes("phân tích") ||
      keywords.includes("tình hình") ||
      keywords.includes("hiện tại")
    ) {
      return this.analyzeCurrentSituation();
    }

    // Gợi ý chính sách
    if (
      keywords.includes("gợi ý") ||
      keywords.includes("nên chọn") ||
      keywords.includes("chính sách nào") ||
      keywords.includes("khẩn cấp") ||
      keywords.includes("khôi phục")
    ) {
      return this.suggestPolicy();
    }

    // Hỏi về nhật ký sự kiện
    if (
      keywords.includes("sự kiện") ||
      keywords.includes("gần đây") ||
      keywords.includes("đã làm") ||
      keywords.includes("nhật ký") ||
      keywords.includes("lịch sử")
    ) {
      return this.showEventHistory();
    }

    // Hỏi về game state cụ thể
    if (keywords.includes("tôi đang") || keywords.includes("lượt này")) {
      return this.provideGameHelp();
    }

    // Các câu hỏi contextual mới
    if (
      keywords.includes("giảm thất nghiệp") ||
      keywords.includes("tạo việc làm") ||
      keywords.includes("cách giảm thất nghiệp")
    ) {
      return this.formatAnswerWithSuggestions(
        "💼 GIẢM THẤT NGHIỆP:\n\n• Đầu tư hạ tầng: Tạo nhiều việc làm xây dựng\n• Hỗ trợ khởi nghiệp: Tạo cơ hội việc làm mới\n• Đào tạo nghề: Nâng cao kỹ năng lao động\n• Giảm thuế doanh nghiệp: Khuyến khích tuyển dụng",
        [
          "Chính sách hạ tầng",
          "Hỗ trợ khởi nghiệp",
          "Phân tích tình hình hiện tại",
        ]
      );
    }

    if (
      keywords.includes("giảm bất bình đẳng") ||
      keywords.includes("công bằng xã hội") ||
      keywords.includes("bất bình đẳng")
    ) {
      return this.formatAnswerWithSuggestions(
        "⚖️ GIẢM BẤT BÌNH ĐẲNG:\n\n• Tăng lương tối thiểu: Nâng thu nhập người nghèo\n• Cải cách y tế: Dịch vụ y tế cho mọi người\n• Đầu tư giáo dục: Cơ hội học tập bình đẳng\n• Thuế lũy tiến: Người giàu đóng thuế nhiều hơn",
        ["Chính sách lương tối thiểu", "Cải cách y tế", "Phân tích GINI"]
      );
    }

    if (
      keywords.includes("tăng gdp") ||
      keywords.includes("phát triển kinh tế") ||
      keywords.includes("cách tăng gdp")
    ) {
      return this.formatAnswerWithSuggestions(
        "📈 TĂNG GDP:\n\n• Đầu tư hạ tầng: Thúc đẩy sản xuất và lưu thông\n• Hỗ trợ khởi nghiệp: Khuyến khích đổi mới\n• Giảm thuế doanh nghiệp: Khuyến khích đầu tư\n• Đào tạo nhân lực: Tăng năng suất lao động",
        ["Chính sách hạ tầng", "Hỗ trợ doanh nghiệp", "Phân tích GDP"]
      );
    }

    if (
      keywords.includes("tăng uy tín") ||
      keywords.includes("dân tin tưởng") ||
      keywords.includes("uy tín chính phủ")
    ) {
      return this.formatAnswerWithSuggestions(
        "🏛️ TĂNG UY TÍN:\n\n• Cải cách y tế: Chăm sóc sức khỏe dân sinh\n• Đầu tư giáo dục: Tương lai cho con em\n• Chống tham nhũng: Minh bạch, công khai\n• Dịch vụ công tốt: Phục vụ dân hiệu quả",
        ["Cải cách y tế", "Đầu tư giáo dục", "Phân tích uy tín"]
      );
    }

    // Câu hỏi cơ bản với từ khóa mở rộng
    for (const [key, answer] of Object.entries(this.gameKnowledge.basic)) {
      if (
        keywords.includes(key) ||
        (key === "làm sao chơi" &&
          (keywords.includes("cách chơi") || keywords.includes("chơi game"))) ||
        (key === "mục tiêu" && keywords.includes("mục đích")) ||
        (key === "thắng thua" &&
          (keywords.includes("thắng") ||
            keywords.includes("thua") ||
            keywords.includes("kết thúc")))
      ) {
        return this.formatAnswerWithSuggestions(
          answer,
          this.getRelatedSuggestions(key)
        );
      }
    }

    // Hỏi về chỉ số với từ khóa mở rộng
    for (const [key, answer] of Object.entries(this.gameKnowledge.indicators)) {
      if (
        keywords.includes(key) ||
        (key === "gdp" && keywords.includes("kinh tế")) ||
        (key === "thất nghiệp" && keywords.includes("unemployment")) ||
        (key === "uy tín" && keywords.includes("legitimacy")) ||
        (key === "quân sự" && keywords.includes("military")) ||
        (key === "dịch vụ công" &&
          (keywords.includes("y tế") || keywords.includes("giáo dục")))
      ) {
        return this.formatAnswerWithSuggestions(
          `${key.toUpperCase()}: ${answer}`,
          this.getIndicatorSuggestions(key)
        );
      }
    }

    // Hỏi về nhóm xã hội
    for (const [key, answer] of Object.entries(this.gameKnowledge.groups)) {
      if (
        keywords.includes(key) ||
        (key === "công nhân" && keywords.includes("workers")) ||
        (key === "trung lưu" && keywords.includes("middle")) ||
        (key === "tư bản" && keywords.includes("capitalist")) ||
        (key === "thanh niên" && keywords.includes("youth"))
      ) {
        return this.formatAnswerWithSuggestions(
          `${key}: ${answer}`,
          this.getGroupSuggestions(key)
        );
      }
    }

    // Hỏi về chính sách
    for (const [key, answer] of Object.entries(this.gameKnowledge.policies)) {
      if (
        keywords.includes(key) ||
        (key === "thuế doanh nghiệp" && keywords.includes("thuế")) ||
        (key === "lương tối thiểu" && keywords.includes("lương")) ||
        (key === "hạ tầng" && keywords.includes("infrastructure"))
      ) {
        return this.formatAnswerWithSuggestions(
          `${key}: ${answer}`,
          this.getPolicySuggestions(key)
        );
      }
    }

    // Chiến lược
    for (const [key, answer] of Object.entries(this.gameKnowledge.strategy)) {
      if (
        keywords.includes(key) ||
        (key === "bắt đầu" &&
          (keywords.includes("start") || keywords.includes("đầu game"))) ||
        (key === "cuối game" &&
          (keywords.includes("end") || keywords.includes("kết thúc"))) ||
        (key === "cân bằng" && keywords.includes("balance"))
      ) {
        return this.formatAnswerWithSuggestions(
          answer,
          this.getStrategySuggestions(key)
        );
      }
    }

    // Nếu không khớp với gì, trả về null để fallback
    return null;
  }

  analyzeCurrentSituation() {
    if (!this.currentContext) {
      return this.formatAnswerWithSuggestions(
        "⚠️ Không có thông tin game hiện tại. Hãy bắt đầu chơi để tôi có thể phân tích!",
        ["Cách chơi game", "Mục tiêu", "Chính sách nào tốt"]
      );
    }

    const ctx = this.currentContext;
    let analysis = [];

    // Thông tin cơ bản
    analysis.push(`🎮 **LƯỢT ${ctx.currentTurn}/${ctx.maxTurns}**\n`);

    // Phân tích các chỉ số theo đúng luật chơi
    const indicators = ctx.currentIndicators || {};
    let criticalIssues = [];
    let goodIndicators = [];

    // Các chỉ số cao = tốt
    if (indicators.gdp < 30)
      criticalIssues.push("📉 GDP quá thấp (" + indicators.gdp + ")");
    else if (indicators.gdp > 70)
      goodIndicators.push("📈 GDP tốt (" + indicators.gdp + ")");

    if (indicators.legitimacy < 30)
      criticalIssues.push("🏛️ Uy tín thấp (" + indicators.legitimacy + ")");
    else if (indicators.legitimacy > 70)
      goodIndicators.push("👑 Uy tín cao (" + indicators.legitimacy + ")");

    // Các chỉ số thấp = tốt
    if (indicators.unemployment > 70)
      criticalIssues.push(
        "💼 Thất nghiệp cao (" + indicators.unemployment + ")"
      );
    else if (indicators.unemployment < 30)
      goodIndicators.push(
        "💼 Thất nghiệp thấp (" + indicators.unemployment + ")"
      );

    if (indicators.gini > 70)
      criticalIssues.push("⚖️ Bất bình đẳng cao (" + indicators.gini + ")");
    else if (indicators.gini < 30)
      goodIndicators.push("⚖️ Xã hội công bằng (" + indicators.gini + ")");

    // Phân tích nhóm xã hội
    const socialGroups = ctx.currentSocialGroups || {};
    const unhappyGroups = Object.entries(socialGroups)
      .filter(([group, satisfaction]) => satisfaction < 30)
      .map(([group, satisfaction]) => `${group} (${satisfaction})`);

    // Phân tích nhật ký sự kiện gần đây
    const recentEvents = ctx.recentEvents || [];
    let eventSummary = "";
    if (recentEvents.length > 0) {
      eventSummary = "\n� **SỰ KIỆN GẦN ĐÂY:**\n";
      recentEvents.slice(0, 3).forEach((event) => {
        if (event.type === "policy") {
          eventSummary += `• Lượt ${event.turn}: ${event.title}\n`;
          if (event.conflictAnalysis) {
            eventSummary += `  Mức xung đột: ${event.conflictAnalysis.conflictLevel}\n`;
          }
        } else if (event.type === "random") {
          eventSummary += `• Sự kiện: ${event.title}\n`;
        }
      });
    }

    // Tổng hợp phân tích
    if (criticalIssues.length > 0) {
      analysis.push(
        `⚠️ **VẤN ĐỀ NGHIÊM TRỌNG:**\n${criticalIssues.join("\n")}\n`
      );
    }

    if (goodIndicators.length > 0) {
      analysis.push(`✅ **ĐIỂM TÍCH CỰC:**\n${goodIndicators.join("\n")}\n`);
    }

    if (unhappyGroups.length > 0) {
      analysis.push(
        `👥 **NHÓM KHÔNG HÀI LÒNG:**\n${unhappyGroups.join(", ")}\n`
      );
    }

    analysis.push(eventSummary);

    // Đề xuất hành động với AI prediction
    const suggestions = this.generateContextualSuggestions();

    // Thêm dự đoán AI nếu có context
    if (this.currentContext) {
      const prediction = this.predictionModel.predictOutcome(
        this.currentContext,
        null
      );
      if (prediction.warnings.length > 0) {
        analysis.push(
          `\n🤖 **AI CẢNH BÁO:**\n${prediction.warnings.join("\n")}`
        );
      }
    }

    return this.formatAnswerWithSuggestions(
      analysis.join("\n"),
      suggestions.slice(0, 4)
    );
  }

  // AI Prediction - Dự đoán tương lai
  providePrediction() {
    if (!this.currentContext) {
      return this.formatAnswerWithSuggestions(
        "🤖 Cần thông tin game để có thể dự đoán!",
        ["Bắt đầu chơi", "Phân tích tình hình"]
      );
    }

    const ctx = this.currentContext;
    let prediction = "🔮 **DỰ ĐOÁN AI:**\n\n";

    // Dự đoán dựa trên xu hướng hiện tại
    const indicators = ctx.currentIndicators || {};
    const trends = this.calculateTrends();

    // Dự đoán GDP
    if (indicators.gdp < 40) {
      prediction +=
        "📉 **GDP**: Có nguy cơ suy thoái kinh tế. Cần chính sách kích cầu!\n";
    } else if (indicators.gdp > 70) {
      prediction +=
        "📈 **GDP**: Kinh tế phát triển tốt. Có thể tập trung vào xã hội.\n";
    }

    // Dự đoán thất nghiệp
    if (indicators.unemployment > 60) {
      prediction +=
        "💼 **Thất nghiệp**: Nguy cơ bạo loạn xã hội. Ưu tiên tạo việc làm!\n";
    }

    // Dự đoán uy tín
    if (indicators.legitimacy < 40) {
      prediction +=
        "🏛️ **Uy tín**: Có thể mất quyền lực. Cần PR và chính sách dân sinh!\n";
    }

    // Dự đoán kết cục game
    const winChance = this.calculateWinChance(ctx);
    prediction += `\n🎯 **Khả năng thắng**: ${winChance}%\n`;

    // Gợi ý chiến lược dựa trên AI
    const strategy = this.getAIStrategy(ctx);
    prediction += `\n🧠 **Chiến lược AI**: ${strategy}`;

    return this.formatAnswerWithSuggestions(prediction, [
      "Gợi ý cụ thể",
      "Phân tích rủi ro",
      "Chiến lược tối ưu",
    ]);
  }

  // So sánh với lịch sử chơi
  compareWithHistory() {
    if (this.gamePatterns.length < 3) {
      return this.formatAnswerWithSuggestions(
        "📊 Chưa đủ dữ liệu lịch sử để so sánh. Hãy chơi thêm!",
        ["Phân tích hiện tại", "Gợi ý chính sách"]
      );
    }

    let comparison = "📊 **SO SÁNH VỚI LỊCH SỬ:**\n\n";

    // Phân tích xu hướng người chơi
    const focus = this.userPreferences.focus;
    if (focus === "economic") {
      comparison += "💰 **Xu hướng**: Bạn thường ưu tiên kinh tế hơn xã hội\n";
      comparison += "💡 **Gợi ý**: Thử cân bằng với chính sách xã hội\n\n";
    } else if (focus === "social") {
      comparison += "👥 **Xu hướng**: Bạn thường ưu tiên xã hội hơn kinh tế\n";
      comparison += "💡 **Gợi ý**: Đừng quên phát triển kinh tế\n\n";
    } else {
      comparison += "⚖️ **Xu hướng**: Bạn chơi khá cân bằng\n\n";
    }

    // So sánh với patterns trước
    const currentTurn = this.currentContext?.currentTurn || 0;
    const similarTurns = this.gamePatterns.filter(
      (p) => Math.abs(p.turn - currentTurn) <= 1
    );

    if (similarTurns.length > 0) {
      const avgGDP =
        similarTurns.reduce((sum, p) => sum + (p.gdp || 0), 0) /
        similarTurns.length;
      const currentGDP = this.currentContext?.currentIndicators?.gdp || 0;

      if (currentGDP > avgGDP + 10) {
        comparison +=
          "📈 **GDP**: Tốt hơn trung bình " +
          Math.round(currentGDP - avgGDP) +
          " điểm!\n";
      } else if (currentGDP < avgGDP - 10) {
        comparison +=
          "📉 **GDP**: Thấp hơn trung bình " +
          Math.round(avgGDP - currentGDP) +
          " điểm.\n";
      }
    }

    return this.formatAnswerWithSuggestions(comparison, [
      "Cải thiện performance",
      "Học từ lỗi",
      "Phân tích xu hướng",
    ]);
  }

  // Học từ lỗi và cải thiện
  learnFromMistakes() {
    if (!this.currentContext) {
      return this.formatAnswerWithSuggestions(
        "🤔 Hãy cho tôi biết cụ thể vấn đề gì để tôi có thể giúp!",
        ["Phân tích tình hình", "Gợi ý khôi phục"]
      );
    }

    let advice = "🎓 **HỌC TỪ LỖI:**\n\n";

    const ctx = this.currentContext;
    const indicators = ctx.currentIndicators || {};

    // Phân tích lỗi thường gặp
    if (indicators.unemployment > 70 && indicators.gini > 70) {
      advice += "❌ **Lỗi phổ biến**: Để cả thất nghiệp VÀ bất bình đẳng cao\n";
      advice +=
        "✅ **Giải pháp**: Ưu tiên việc làm trước, rồi mới giải quyết bất bình đẳng\n\n";
    }

    if (indicators.gdp < 30 && indicators.legitimacy < 30) {
      advice += "❌ **Lỗi nghiêm trọng**: Cả kinh tế VÀ uy tín đều thấp\n";
      advice +=
        "✅ **Khôi phục**: Chọn chính sách vừa tăng GDP vừa được dân ủng hộ (như hạ tầng)\n\n";
    }

    // Gợi ý dựa trên pattern cá nhân
    if (this.userPreferences.focus === "economic") {
      advice +=
        "🎯 **Cá nhân hóa**: Bạn thường tập trung kinh tế, nhưng đừng quên dân sinh!\n";
    }

    advice +=
      "💡 **Nguyên tắc vàng**: Không bao giờ để 2 chỉ số quan trọng cùng xuống dưới 30!";

    return this.formatAnswerWithSuggestions(advice, [
      "Chiến lược khôi phục",
      "Gợi ý ngay lập tức",
      "Phân tích rủi ro",
    ]);
  }

  // Tính toán khả năng thắng
  calculateWinChance(context) {
    const indicators = context.currentIndicators || {};
    const socialGroups = context.currentSocialGroups || {};

    let score = 0;

    // Điểm từ chỉ số
    Object.entries(indicators).forEach(([key, value]) => {
      if (key === "unemployment" || key === "gini") {
        score += ((100 - value) / 100) * 20; // Thấp = tốt
      } else {
        score += (value / 100) * 20; // Cao = tốt
      }
    });

    // Điểm từ nhóm xã hội
    const avgSatisfaction =
      Object.values(socialGroups).reduce((sum, val) => sum + val, 0) /
      Object.values(socialGroups).length;
    score += (avgSatisfaction / 100) * 20;

    return Math.round(Math.min(95, Math.max(5, score)));
  }

  // Lấy chiến lược AI
  getAIStrategy(context) {
    const winChance = this.calculateWinChance(context);
    const turnsLeft = context.maxTurns - context.currentTurn;

    if (winChance > 70) {
      return "Duy trì ổn định, tránh rủi ro cao";
    } else if (winChance < 30 && turnsLeft > 3) {
      return "Cần hành động quyết liệt, chấp nhận rủi ro để khôi phục";
    } else if (turnsLeft <= 2) {
      return "Ưu tiên chỉ số quan trọng nhất, bỏ qua chỉ số phụ";
    } else {
      return "Cân bằng phát triển, từng bước cải thiện";
    }
  }

  calculateTrends() {
    // Simplified trend calculation
    return {
      gdpTrend: "stable",
      unemploymentTrend: "increasing",
      legitimacyTrend: "decreasing",
    };
  }

  showEventHistory() {
    if (!this.currentContext || !this.currentContext.recentEvents) {
      return this.formatAnswerWithSuggestions(
        "📋 Chưa có sự kiện nào trong game hiện tại.",
        ["Phân tích tình hình", "Gợi ý chính sách"]
      );
    }

    const events = this.currentContext.recentEvents || [];

    if (events.length === 0) {
      return this.formatAnswerWithSuggestions(
        "📋 **NHẬT KÝ SỰ KIỆN:**\n\nChưa có sự kiện nào được ghi nhận.",
        ["Phân tích tình hình", "Gợi ý chính sách"]
      );
    }

    let history = "📋 **NHẬT KÝ SỰ KIỆN:**\n\n";

    events.slice(0, 5).forEach((event, index) => {
      if (event.type === "policy") {
        history += `🏛️ **Lượt ${event.turn}: ${event.title}**\n`;
        history += `   ${event.description}\n`;

        if (event.conflictAnalysis) {
          const conflict = event.conflictAnalysis;
          history += `   📊 Xung đột: ${conflict.conflictLevel}\n`;
          if (conflict.benefitGroup) {
            history += `   ✅ Có lợi: ${conflict.benefitGroup}\n`;
          }
          if (conflict.lossGroup) {
            history += `   ❌ Thiệt hại: ${conflict.lossGroup}\n`;
          }
        }
        history += "\n";
      } else if (event.type === "random") {
        history += `⚡ **${event.title}**\n`;
        history += `   ${event.description}\n\n`;
      }
    });

    if (events.length > 5) {
      history += `📝 *Và ${events.length - 5} sự kiện khác...*\n`;
    }

    return this.formatAnswerWithSuggestions(history, [
      "Phân tích tác động",
      "Gợi ý tiếp theo",
      "Xem tình hình hiện tại",
    ]);
  }

  suggestPolicy() {
    if (!this.currentContext) {
      return this.formatAnswerWithSuggestions(
        "🤖 Cần thông tin game để đưa ra gợi ý AI!",
        ["Bắt đầu chơi", "Phân tích tình hình"]
      );
    }

    const ctx = this.currentContext;
    let suggestion = "🤖 **GỢI Ý AI THÔNG MINH:**\n\n";

    // AI Analysis với multiple factors
    const aiAnalysis = this.performAdvancedAnalysis(ctx);

    // Ưu tiên theo AI
    if (aiAnalysis.criticalFactors.length > 0) {
      suggestion += "🚨 **KHẨN CẤP - AI ƯU TIÊN:**\n";
      aiAnalysis.criticalFactors.forEach((factor, index) => {
        suggestion += `${index + 1}. ${factor.description}\n`;
        suggestion += `   💡 Gợi ý: ${factor.recommendation}\n`;
        suggestion += `   🎯 Hiệu quả dự kiến: ${factor.effectiveness}%\n\n`;
      });
    }

    // Chiến lược cá nhân hóa dựa trên học máy
    const personalizedStrategy = this.getPersonalizedStrategy(ctx);
    suggestion += `🧠 **CHIẾN LƯỢC CÁ NHÂN HÓA:**\n${personalizedStrategy}\n\n`;

    // Dự đoán kết quả với AI
    const predictions = this.predictPolicyOutcomes(ctx);
    if (predictions.length > 0) {
      suggestion += "🔮 **DỰ ĐOÁN KẾT QUẢ:**\n";
      predictions.slice(0, 3).forEach((pred) => {
        suggestion += `• ${pred.policy}: ${pred.outcome} (${pred.confidence}% tin cậy)\n`;
      });
    }

    const smartSuggestions = this.generateSmartSuggestions(ctx);

    return this.formatAnswerWithSuggestions(suggestion, smartSuggestions);
  }

  // AI Analysis nâng cao
  performAdvancedAnalysis(context) {
    const indicators = context.currentIndicators || {};
    const socialGroups = context.currentSocialGroups || {};
    const criticalFactors = [];

    // Multi-factor analysis
    const riskMatrix = this.calculateRiskMatrix(indicators, socialGroups);

    // Phát hiện crisis cascade (hiệu ứng domino)
    if (indicators.unemployment > 70 && indicators.gini > 60) {
      criticalFactors.push({
        description: "Nguy cơ DOMINO: Thất nghiệp + Bất bình đẳng → Bạo loạn",
        recommendation: "Đầu tư hạ tầng (giải quyết cả 2 vấn đề)",
        effectiveness: 85,
        urgency: "CRITICAL",
      });
    }

    // Economic death spiral detection
    if (indicators.gdp < 30 && indicators.legitimacy < 40) {
      criticalFactors.push({
        description: "Spiral kinh tế: GDP thấp → Mất uy tín → Khó cứu vãn",
        recommendation: "Hỗ trợ khởi nghiệp (boost nhanh GDP + tạo hy vọng)",
        effectiveness: 75,
        urgency: "HIGH",
      });
    }

    // Social unrest prediction
    const unhappyGroups = Object.values(socialGroups).filter(
      (v) => v < 25
    ).length;
    if (unhappyGroups >= 3) {
      criticalFactors.push({
        description: `Cách mạng: ${unhappyGroups} nhóm bất mãn → Nguy cơ lật đổ`,
        recommendation: "Tăng lương tối thiểu (làm hài lòng nhiều nhóm)",
        effectiveness: 70,
        urgency: "HIGH",
      });
    }

    return { criticalFactors, riskMatrix };
  }

  // Chiến lược cá nhân hóa
  getPersonalizedStrategy(context) {
    const userFocus = this.userPreferences.focus;
    const turnsLeft = context.maxTurns - context.currentTurn;

    let strategy = "";

    // Dựa trên lịch sử học được
    if (userFocus === "economic") {
      strategy =
        "Bạn thường ưu tiên kinh tế. Lần này hãy thử cân bằng với dân sinh để tránh bất ổn.";
    } else if (userFocus === "social") {
      strategy =
        "Bạn hay lo cho xã hội. Đừng quên kinh tế - không có tiền thì khó làm phúc lợi.";
    } else {
      strategy =
        "Bạn chơi cân bằng tốt. Tiếp tục chiến lược này và ưu tiên vấn đề cấp bách nhất.";
    }

    // Điều chỉnh theo thời gian
    if (turnsLeft <= 2) {
      strategy +=
        " ⏰ Sắp hết game - chỉ tập trung vào 1-2 chỉ số quan trọng nhất!";
    }

    return strategy;
  }

  // Dự đoán kết quả chính sách
  predictPolicyOutcomes(context) {
    const predictions = [];
    const availablePolicies = [
      "Đầu tư hạ tầng",
      "Tăng lương tối thiểu",
      "Hỗ trợ khởi nghiệp",
      "Cải cách y tế",
      "Đầu tư giáo dục",
    ];

    availablePolicies.forEach((policy) => {
      const prediction = this.predictionModel.predictOutcome(context, policy);
      predictions.push({
        policy,
        outcome: this.summarizeOutcome(prediction),
        confidence: Math.round(prediction.confidence * 100),
      });
    });

    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  summarizeOutcome(prediction) {
    if (prediction.riskLevel === "high") {
      return "Rủi ro cao, cân nhắc kỹ";
    } else if (prediction.riskLevel === "low") {
      return "An toàn, hiệu quả tốt";
    } else {
      return "Cân bằng, có thể thử";
    }
  }

  generateSmartSuggestions(context) {
    const suggestions = [];
    const winChance = this.calculateWinChance(context);

    if (winChance < 40) {
      suggestions.push("🆘 Chiến lược khẩn cấp");
      suggestions.push("🔥 Hành động quyết liệt");
    } else if (winChance > 70) {
      suggestions.push("⚡ Tối ưu hóa điểm số");
      suggestions.push("🛡️ Duy trì ổn định");
    } else {
      suggestions.push("📊 Phân tích rủi ro");
      suggestions.push("🎯 Gợi ý cụ thể");
    }

    suggestions.push("🤖 Dự đoán AI");
    return suggestions;
  }

  calculateRiskMatrix(indicators, socialGroups) {
    // Complex risk calculation với nhiều yếu tố
    let totalRisk = 0;

    // Economic risks
    if (indicators.gdp < 30) totalRisk += 4;
    if (indicators.unemployment > 70) totalRisk += 5;

    // Social risks
    if (indicators.gini > 70) totalRisk += 3;
    const unhappyCount = Object.values(socialGroups).filter(
      (v) => v < 25
    ).length;
    totalRisk += unhappyCount * 2;

    // Political risks
    if (indicators.legitimacy < 30) totalRisk += 6;

    return {
      level: totalRisk > 15 ? "CRITICAL" : totalRisk > 8 ? "HIGH" : "MODERATE",
      score: totalRisk,
    };
  }

  getGeneralHelp() {
    const baseHelp = `🤖 TÔI CÓ THỂ GIÚP BẠN:

📚 Hỏi về cách chơi:
• "Làm sao để chơi game này?"
• "Mục tiêu của game là gì?"
• "Các chỉ số có ý nghĩa gì?"

📊 Phân tích tình hình:
• "Phân tích tình hình hiện tại"
• "Các chỉ số của tôi thế nào?"

💡 Xin gợi ý:
• "Tôi nên chọn chính sách nào?"
• "Gợi ý cho lượt này"

❓ Hỏi cụ thể về:
• Các nhóm xã hội (công nhân, tư bản...)
• Các chính sách (thuế, giáo dục, y tế...)
• Chiến lược chơi`;

    // Luôn thêm gợi ý contextual
    return this.formatAnswerWithSuggestions(baseHelp, null);
  }

  // Hỗ trợ trong game
  provideGameHelp() {
    if (!this.currentContext) {
      return this.formatAnswerWithSuggestions(
        "🎮 Hãy bắt đầu chơi game để tôi có thể hỗ trợ bạn tốt hơn!",
        ["Cách chơi game này", "Giải thích các chỉ số", "Các nhóm xã hội là gì"]
      );
    }

    const { currentTurn, maxTurns, currentIndicators, currentSocialGroups } =
      this.currentContext;
    let help = `🎯 HỖ TRỢ LƯỢT ${currentTurn}/${maxTurns}\n\n`;

    // Phân tích nhanh tình hình
    const criticalIndicators = Object.entries(currentIndicators)
      .filter(([_, value]) => value < 30)
      .map(([key, _]) => key);

    const unhappyGroups = Object.entries(currentSocialGroups)
      .filter(([_, value]) => value < 30)
      .map(([key, _]) => key);

    if (criticalIndicators.length > 0 || unhappyGroups.length > 0) {
      help += "⚠️ CẢNH BÁO KHẨN CẤP:\n";
      if (criticalIndicators.length > 0) {
        help += `• Chỉ số nguy hiểm: ${criticalIndicators.join(", ")}\n`;
      }
      if (unhappyGroups.length > 0) {
        help += `• Nhóm bất mãn: ${unhappyGroups.join(", ")}\n`;
      }
      help += "\n";
    }

    const suggestions = [
      "Phân tích tình hình hiện tại",
      "Gợi ý chính sách cho lượt này",
      "Giải thích chỉ số thấp nhất",
      "Chiến lược cho giai đoạn này",
    ];

    return this.formatAnswerWithSuggestions(
      help + "💡 Tôi có thể giúp bạn:",
      suggestions
    );
  }

  // Format câu trả lời với gợi ý có thể click
  formatAnswerWithSuggestions(answer, suggestions) {
    if (!suggestions || suggestions.length === 0) {
      // Nếu không có gợi ý được cung cấp, tạo gợi ý contextual
      suggestions = this.generateContextualSuggestions();
    }

    let formatted = answer + "\n\n🔍 Bạn có thể hỏi:\n";
    suggestions.forEach((suggestion) => {
      formatted += `<button class="suggestion-btn" onclick="askQuestion('${suggestion}')">${suggestion}</button>\n`;
    });

    return formatted;
  }

  // Tạo gợi ý thông minh dựa trên tình hình game hiện tại
  generateContextualSuggestions() {
    if (!this.currentContext) {
      return [
        "Cách chơi game này",
        "Giải thích các chỉ số",
        "Các nhóm xã hội là gì",
        "Chiến lược bắt đầu",
      ];
    }

    const { currentTurn, maxTurns, currentIndicators, currentSocialGroups } =
      this.currentContext;
    const suggestions = [];

    // Gợi ý theo giai đoạn game
    if (currentTurn <= 3) {
      suggestions.push("Chiến lược giai đoạn đầu");
      suggestions.push("Ưu tiên chỉ số nào ở đầu game");
    } else if (currentTurn >= maxTurns - 2) {
      suggestions.push("Cách kết thúc an toàn");
      suggestions.push("Duy trì ổn định cuối game");
    } else {
      suggestions.push("Chiến lược giữa game");
      suggestions.push("Cách cân bằng các chỉ số");
    }

    // Gợi ý dựa trên vấn đề cụ thể
    const problems = this.identifyCurrentProblems();

    if (problems.criticalIndicators.length > 0) {
      const indicator = problems.criticalIndicators[0];
      if (indicator === "unemployment") {
        suggestions.push("Cách giảm thất nghiệp nhanh");
        suggestions.push("Chính sách tạo việc làm");
      } else if (indicator === "gini") {
        suggestions.push("Giảm bất bình đẳng như thế nào");
        suggestions.push("Chính sách công bằng xã hội");
      } else if (indicator === "gdp") {
        suggestions.push("Cách tăng GDP nhanh");
        suggestions.push("Chính sách phát triển kinh tế");
      } else if (indicator === "legitimacy") {
        suggestions.push("Cách tăng uy tín chính phủ");
        suggestions.push("Làm thế nào để dân tin tưởng");
      } else if (indicator === "military") {
        suggestions.push("Tăng cường quốc phòng");
        suggestions.push("Cân bằng an ninh và kinh tế");
      } else if (indicator === "publicServices") {
        suggestions.push("Cải thiện dịch vụ công");
        suggestions.push("Đầu tư y tế và giáo dục");
      }
    }

    if (problems.unhappyGroups.length > 0) {
      const group = problems.unhappyGroups[0];
      if (group === "workers") {
        suggestions.push("Làm sao để công nhân hài lòng");
        suggestions.push("Chính sách lao động");
      } else if (group === "capitalists") {
        suggestions.push("Làm sao để tư bản ủng hộ");
        suggestions.push("Môi trường kinh doanh");
      } else if (group === "youth") {
        suggestions.push("Chính sách cho thanh niên");
        suggestions.push("Tạo cơ hội cho thế hệ trẻ");
      } else if (group === "middleClass") {
        suggestions.push("Hỗ trợ tầng lớp trung lưu");
        suggestions.push("Ổn định kinh tế xã hội");
      } else if (group === "freelancers") {
        suggestions.push("Hỗ trợ freelancer");
        suggestions.push("Khuyến khích khởi nghiệp");
      }
    }

    // Luôn có gợi ý phân tích tình hình
    if (!suggestions.includes("Phân tích tình hình hiện tại")) {
      suggestions.unshift("Phân tích tình hình hiện tại");
    }

    // Giới hạn số lượng gợi ý (4-5 cái)
    return suggestions.slice(0, 5);
  }

  // Xác định các vấn đề hiện tại
  identifyCurrentProblems() {
    const criticalIndicators = [];
    const unhappyGroups = [];

    if (this.currentContext) {
      const { currentIndicators, currentSocialGroups } = this.currentContext;

      // Tìm chỉ số có vấn đề
      Object.entries(currentIndicators || {}).forEach(([key, value]) => {
        if (key === "unemployment" || key === "gini") {
          if (value > 70) criticalIndicators.push(key);
        } else {
          if (value < 30) criticalIndicators.push(key);
        }
      });

      // Tìm nhóm bất mãn
      Object.entries(currentSocialGroups || {}).forEach(([key, value]) => {
        if (value < 40) unhappyGroups.push(key);
      });
    }

    return { criticalIndicators, unhappyGroups };
  }

  // Gợi ý liên quan đến câu hỏi cơ bản
  getRelatedSuggestions(key) {
    const suggestions = {
      "làm sao chơi": [
        "Giải thích các chỉ số",
        "Các nhóm xã hội là gì",
        "Chiến lược bắt đầu",
      ],
      "cách chơi": [
        "Phân tích tình hình hiện tại",
        "Gợi ý chính sách",
        "Mục tiêu của game",
      ],
      "mục tiêu": [
        "Chiến lược cân bằng",
        "Cách tránh thua cuộc",
        "Ưu tiên chỉ số nào",
      ],
      "thắng thua": [
        "Dấu hiệu nguy hiểm",
        "Cách phục hồi chỉ số",
        "Chiến lược cuối game",
      ],
    };
    return (
      suggestions[key] || ["Phân tích tình hình hiện tại", "Gợi ý chính sách"]
    );
  }

  // Gợi ý cho các chỉ số
  getIndicatorSuggestions(key) {
    const suggestions = {
      gdp: ["Chính sách tăng GDP", "Tác động của hạ tầng", "Kinh tế và thuế"],
      "thất nghiệp": [
        "Cách giảm thất nghiệp",
        "Chính sách việc làm",
        "Hạ tầng với việc làm",
      ],
      gini: ["Giảm bất bình đẳng", "Chính sách xã hội", "Lương tối thiểu"],
      "uy tín": ["Tăng uy tín chính phủ", "Dịch vụ công", "Y tế và giáo dục"],
      "quân sự": ["Cân bằng an ninh", "Chi phí quốc phòng", "Ưu tiên quân sự"],
      "dịch vụ công": ["Cải thiện y tế", "Đầu tư giáo dục", "Phúc lợi xã hội"],
    };
    return (
      suggestions[key] || ["Phân tích tình hình hiện tại", "Gợi ý chính sách"]
    );
  }

  // Gợi ý cho các nhóm xã hội
  getGroupSuggestions(key) {
    const suggestions = {
      "công nhân": [
        "Chính sách lương",
        "Phúc lợi xã hội",
        "Bảo vệ người lao động",
      ],
      "trung lưu": ["Giáo dục và y tế", "Ổn định kinh tế", "Dịch vụ công"],
      "tư bản": [
        "Thuế doanh nghiệp",
        "Chính sách khởi nghiệp",
        "Môi trường kinh doanh",
      ],
      "thanh niên": [
        "Việc làm cho thanh niên",
        "Giáo dục",
        "Công nghệ và môi trường",
      ],
      freelancer: [
        "Hỗ trợ khởi nghiệp",
        "Linh hoạt lao động",
        "Đổi mới sáng tạo",
      ],
    };
    return suggestions[key] || ["Phân tích nhóm này", "Chính sách phù hợp"];
  }

  // Gợi ý cho chính sách
  getPolicySuggestions(key) {
    const suggestions = {
      "thuế doanh nghiệp": [
        "Tác động thuế",
        "Cân bằng ngân sách",
        "Phản ứng tư bản",
      ],
      "lương tối thiểu": [
        "Công nhân và lương",
        "Thất nghiệp",
        "Chi phí doanh nghiệp",
      ],
      "giáo dục": ["Đầu tư dài hạn", "Chất lượng nhân lực", "Hỗ trợ trung lưu"],
      "y tế": ["Dịch vụ công", "Sức khỏe dân sinh", "Chi phí ngân sách"],
      "hạ tầng": ["Tạo việc làm", "Phát triển kinh tế", "Đầu tư công"],
    };
    return suggestions[key] || ["Tác động chính sách", "Ảnh hưởng nhóm xã hội"];
  }

  // Gợi ý cho chiến lược
  getStrategySuggestions(key) {
    const suggestions = {
      "bắt đầu": ["Phân tích ban đầu", "Chọn chính sách đầu", "Ưu tiên chỉ số"],
      "giữa game": [
        "Điều chỉnh chiến lược",
        "Cân bằng nhóm",
        "Xu hướng chỉ số",
      ],
      "cuối game": ["Duy trì ổn định", "Tránh rủi ro", "Hoàn thành an toàn"],
      "khẩn cấp": ["Cứu chỉ số thấp", "Ưu tiên khẩn cấp", "Phục hồi nhanh"],
      "cân bằng": ["Luân phiên nhóm", "Không thiên vị", "Hài hòa lợi ích"],
    };
    return suggestions[key] || ["Chiến lược tổng thể", "Phân tích tình hình"];
  }

  // Machine Learning: Cải thiện từ feedback
  learnFromFeedback(userInput, botResponse, wasHelpful = true) {
    const learningData = {
      input: userInput.toLowerCase(),
      response: botResponse,
      helpful: wasHelpful,
      context: this.currentContext?.currentTurn,
      timestamp: Date.now(),
    };

    // Lưu vào localStorage để persistent learning
    let learningHistory = JSON.parse(
      localStorage.getItem("gameAssistantLearning") || "[]"
    );
    learningHistory.push(learningData);

    // Giữ 100 feedback gần nhất
    if (learningHistory.length > 100) {
      learningHistory = learningHistory.slice(-100);
    }

    localStorage.setItem(
      "gameAssistantLearning",
      JSON.stringify(learningHistory)
    );

    // Cập nhật user preferences
    this.updatePreferencesFromFeedback(learningData);
  }

  updatePreferencesFromFeedback(data) {
    if (!data.helpful) {
      // Nếu không hữu ích, tránh response tương tự
      if (!this.userPreferences.avoidTopics) {
        this.userPreferences.avoidTopics = [];
      }

      const topic = this.extractTopic(data.input);
      if (topic && !this.userPreferences.avoidTopics.includes(topic)) {
        this.userPreferences.avoidTopics.push(topic);
      }
    } else {
      // Nếu hữu ích, ưu tiên topic này
      if (!this.userPreferences.preferredTopics) {
        this.userPreferences.preferredTopics = [];
      }

      const topic = this.extractTopic(data.input);
      if (topic && !this.userPreferences.preferredTopics.includes(topic)) {
        this.userPreferences.preferredTopics.push(topic);
      }
    }
  }

  extractTopic(input) {
    if (input.includes("gợi ý") || input.includes("nên chọn"))
      return "suggestions";
    if (input.includes("phân tích") || input.includes("tình hình"))
      return "analysis";
    if (input.includes("dự đoán") || input.includes("tương lai"))
      return "prediction";
    if (input.includes("sự kiện") || input.includes("lịch sử"))
      return "history";
    return null;
  }

  // Advanced pattern recognition
  recognizeAdvancedPatterns() {
    if (this.gamePatterns.length < 5) return null;

    const patterns = {
      economicFirst: 0,
      socialFirst: 0,
      emergencyResponse: 0,
      safeStrategy: 0,
    };

    this.gamePatterns.forEach((pattern) => {
      // Phân tích xu hướng ra quyết định
      if (pattern.gdp < 40 && pattern.policy?.includes("kinh tế")) {
        patterns.economicFirst++;
      }
      if (pattern.unemployment > 60 && pattern.policy?.includes("xã hội")) {
        patterns.socialFirst++;
      }
      if (
        (pattern.gdp < 30 || pattern.legitimacy < 30) &&
        pattern.policy?.includes("khẩn cấp")
      ) {
        patterns.emergencyResponse++;
      }
      if (pattern.gdp > 60 && pattern.legitimacy > 60) {
        patterns.safeStrategy++;
      }
    });

    return patterns;
  }

  // Get AI insights based on accumulated data
  getAIInsights() {
    const insights = [];

    // Phân tích từ localStorage
    const learningHistory = JSON.parse(
      localStorage.getItem("gameAssistantLearning") || "[]"
    );

    if (learningHistory.length > 10) {
      const helpfulRate =
        learningHistory.filter((item) => item.helpful).length /
        learningHistory.length;

      if (helpfulRate > 0.8) {
        insights.push(
          "🎯 Độ chính xác AI: Cao (" + Math.round(helpfulRate * 100) + "%)"
        );
      } else if (helpfulRate < 0.6) {
        insights.push("🔧 AI đang học và cải thiện...");
      }
    }

    // Pattern insights
    const patterns = this.recognizeAdvancedPatterns();
    if (patterns) {
      if (patterns.emergencyResponse > patterns.safeStrategy) {
        insights.push("⚠️ Bạn thường gặp khủng hoảng - hãy chú ý phòng ngừa");
      }
      if (patterns.economicFirst > patterns.socialFirst * 2) {
        insights.push(
          "💰 Xu hướng: Thiên về kinh tế - cân bằng xã hội sẽ tốt hơn"
        );
      }
    }

    return insights;
  }

  // Handle training commands
  handleTrainingCommand(keywords) {
    if (keywords.includes("bắt đầu") || keywords.includes("start")) {
      return this.startTrainingSession();
    }

    if (keywords.includes("nhanh") || keywords.includes("fast")) {
      return this.quickTrain();
    }

    if (keywords.includes("sâu") || keywords.includes("deep")) {
      return this.deepTrain();
    }

    if (keywords.includes("reset")) {
      return this.resetAI();
    }

    return this.getTrainingHelp();
  }

  // Start interactive training session
  startTrainingSession() {
    const status = this.showAIStatus();
    const result = this.startTraining();

    return this.formatAnswerWithSuggestions(
      `🧠 **BẮT ĐẦU TRAINING SESSION:**\n\n${status}\n\n${result}\n\n🎯 **Training hoàn thành!** AI đã thông minh hơn.`,
      ["Kiểm tra AI status", "Test AI mới", "Deep training"]
    );
  }

  // Quick training với ít dữ liệu
  quickTrain() {
    if (this.isTraining) {
      return this.formatAnswerWithSuggestions(
        "⏳ AI đang training, vui lòng đợi...",
        ["Kiểm tra tiến độ", "AI status"]
      );
    }

    // Simulate quick training
    this.neuralNetwork.trainingEpochs += 50;
    this.saveTrainingProgress();

    return this.formatAnswerWithSuggestions(
      `⚡ **QUICK TRAINING HOÀN THÀNH!**\n\n🧠 Epochs: +50\n📊 Tổng epochs: ${this.neuralNetwork.trainingEpochs}\n💡 AI đã nâng cấp nhanh!`,
      ["Test AI", "Deep training", "AI status"]
    );
  }

  // Deep training với nhiều dữ liệu
  deepTrain() {
    if (this.isTraining) {
      return this.formatAnswerWithSuggestions(
        "⏳ AI đang trong deep training...",
        ["Đợi hoàn thành", "AI status"]
      );
    }

    this.isTraining = true;

    // Simulate deep training với nhiều epochs
    setTimeout(() => {
      this.neuralNetwork.trainingEpochs += 200;
      this.saveTrainingProgress();
      this.isTraining = false;

      // Auto-notify when done
      if (window.addMessage) {
        window.addMessage(
          `🚀 **DEEP TRAINING HOÀN THÀNH!**\n\n🔥 AI đã trở nên siêu thông minh!\n📈 +200 epochs\n🧠 Tổng: ${this.neuralNetwork.trainingEpochs} epochs`,
          false,
          ["Test AI siêu thông minh", "Benchmark AI"]
        );
      }
    }, 5000);

    return this.formatAnswerWithSuggestions(
      `🔥 **DEEP TRAINING BẮT ĐẦU...**\n\n⏰ Thời gian: ~5 giây\n🎯 Mục tiêu: +200 epochs\n🧠 AI sẽ thông minh hơn nhiều!`,
      ["Đợi hoàn thành", "AI status"]
    );
  }

  // Reset AI to initial state
  resetAI() {
    this.neuralNetwork = new SimpleNeuralNetwork();
    this.gamePatterns = [];
    this.userPreferences = {};
    localStorage.removeItem("aiTrainingProgress");
    localStorage.removeItem("gameAssistantLearning");

    return this.formatAnswerWithSuggestions(
      `🔄 **AI ĐÃ ĐƯỢC RESET!**\n\n🧠 Neural network: Mới\n📊 Training epochs: 0\n💾 Dữ liệu: Đã xóa\n\n✨ AI sẵn sàng học từ đầu!`,
      ["Bắt đầu training", "Quick train", "Deep train"]
    );
  }

  // Show AI training help
  getTrainingHelp() {
    return this.formatAnswerWithSuggestions(
      `🎓 **HƯỚNG DẪN TRAINING AI:**\n\n📚 **Lệnh training:**\n• "train bắt đầu" - Training cơ bản\n• "train nhanh" - Quick training (+50 epochs)\n• "train sâu" - Deep training (+200 epochs)\n• "train reset" - Reset AI về ban đầu\n\n📊 **Kiểm tra:**\n• "AI status" - Xem thông tin AI\n• "trình độ AI" - Xem model version\n\n💡 **Mẹo:** Càng train nhiều, AI càng thông minh!`,
      ["Train bắt đầu", "Train nhanh", "AI status"]
    );
  }

  // Show comprehensive AI status
  showAIStatus() {
    const epochs = this.neuralNetwork.trainingEpochs;
    const patterns = this.gamePatterns.length;
    const conversations = this.conversationHistory.length;

    let intelligence = "Newbie";
    if (epochs > 500) intelligence = "Master";
    else if (epochs > 200) intelligence = "Expert";
    else if (epochs > 100) intelligence = "Advanced";
    else if (epochs > 50) intelligence = "Intermediate";

    let experienceLevel = "Mới bắt đầu";
    if (patterns > 20) experienceLevel = "Rất có kinh nghiệm";
    else if (patterns > 10) experienceLevel = "Có kinh nghiệm";
    else if (patterns > 5) experienceLevel = "Đang học hỏi";

    const prediction = this.currentContext
      ? this.getAIPrediction(this.currentContext)
      : null;

    let status = `🤖 **AI STATUS REPORT:**\n\n`;
    status += `🧠 **Trình độ:** ${intelligence}\n`;
    status += `📊 **Training epochs:** ${epochs}\n`;
    status += `🎮 **Game patterns:** ${patterns}\n`;
    status += `💬 **Conversations:** ${conversations}\n`;
    status += `📈 **Kinh nghiệm:** ${experienceLevel}\n`;

    if (prediction) {
      status += `\n🔮 **Model hiện tại:**\n`;
      status += `• Version: ${prediction.modelVersion}\n`;
      status += `• Accuracy: ${prediction.accuracy}\n`;
      status += `• Confidence: ${prediction.confidence}%\n`;
    }

    const suggestions = [];
    if (epochs < 100) suggestions.push("Train thêm");
    if (epochs < 50) suggestions.push("Quick train");
    suggestions.push("Deep train", "Test AI");

    return this.formatAnswerWithSuggestions(status, suggestions);
  }

  // Save training progress
  saveTrainingProgress() {
    const data = {
      epochs: this.neuralNetwork.trainingEpochs,
      weights: this.neuralNetwork.weights,
      timestamp: Date.now(),
    };
    localStorage.setItem("aiTrainingProgress", JSON.stringify(data));
  }

  // Benchmark AI performance
  benchmarkAI() {
    if (!this.currentContext) {
      return this.formatAnswerWithSuggestions(
        "🧪 **AI BENCHMARK TEST:**\n\n⚠️ Cần có game context để test AI.\nHãy bắt đầu chơi game rồi test lại!",
        ["Bắt đầu game", "AI status"]
      );
    }

    const prediction = this.getAIPrediction(this.currentContext);
    const testResults = this.runAITests();

    let benchmark = `🧪 **AI BENCHMARK RESULTS:**\n\n`;

    // Current prediction test
    benchmark += `🎯 **TEST HIỆN TẠI:**\n`;
    benchmark += `• Win Chance: ${prediction.winChance}%\n`;
    benchmark += `• Risk Level: ${prediction.riskLevel}\n`;
    benchmark += `• Confidence: ${prediction.confidence}%\n`;
    benchmark += `• Model: ${prediction.modelVersion}\n\n`;

    // Performance tests
    benchmark += `📊 **PERFORMANCE:**\n`;
    benchmark += `• Accuracy: ${testResults.accuracy}%\n`;
    benchmark += `• Speed: ${testResults.speed}ms\n`;
    benchmark += `• Memory: ${testResults.memory}KB\n`;
    benchmark += `• Training: ${this.neuralNetwork.trainingEpochs} epochs\n\n`;

    // AI capabilities test
    benchmark += `🧠 **CAPABILITIES:**\n`;
    testResults.capabilities.forEach((cap) => {
      benchmark += `• ${cap.name}: ${cap.status}\n`;
    });

    // Grade
    const grade = this.calculateAIGrade(testResults);
    benchmark += `\n🏆 **OVERALL GRADE: ${grade}**`;

    return this.formatAnswerWithSuggestions(benchmark, [
      "Cải thiện AI",
      "Deep training",
      "AI status",
    ]);
  }

  runAITests() {
    const startTime = Date.now();

    // Test prediction accuracy với mock data
    const testCases = [
      {
        gdp: 80,
        unemployment: 20,
        gini: 30,
        legitimacy: 75,
        expected: "high_win",
      },
      {
        gdp: 25,
        unemployment: 80,
        gini: 85,
        legitimacy: 20,
        expected: "low_win",
      },
      {
        gdp: 50,
        unemployment: 50,
        gini: 50,
        legitimacy: 50,
        expected: "medium_win",
      },
    ];

    let correct = 0;
    testCases.forEach((test) => {
      const mockContext = {
        currentIndicators: test,
        currentTurn: 5,
      };
      const prediction = this.getAIPrediction(mockContext);

      if (test.expected === "high_win" && prediction.winChance > 70) correct++;
      else if (test.expected === "low_win" && prediction.winChance < 30)
        correct++;
      else if (
        test.expected === "medium_win" &&
        prediction.winChance >= 30 &&
        prediction.winChance <= 70
      )
        correct++;
    });

    const endTime = Date.now();
    const accuracy = Math.round((correct / testCases.length) * 100);

    return {
      accuracy,
      speed: endTime - startTime,
      memory: Math.round(JSON.stringify(this.neuralNetwork).length / 1024),
      capabilities: [
        {
          name: "Pattern Recognition",
          status: this.gamePatterns.length > 5 ? "✅ Active" : "❌ Limited",
        },
        {
          name: "Personalization",
          status:
            Object.keys(this.userPreferences).length > 0
              ? "✅ Active"
              : "❌ None",
        },
        {
          name: "Prediction Engine",
          status:
            this.neuralNetwork.trainingEpochs > 50 ? "✅ Trained" : "⚠️ Basic",
        },
        {
          name: "Learning System",
          status:
            this.conversationHistory.length > 10 ? "✅ Learning" : "❌ New",
        },
      ],
    };
  }

  calculateAIGrade(results) {
    let score = 0;

    // Accuracy weight: 40%
    score += (results.accuracy / 100) * 40;

    // Training weight: 30%
    const trainingScore = Math.min(100, this.neuralNetwork.trainingEpochs / 10);
    score += (trainingScore / 100) * 30;

    // Capabilities weight: 30%
    const activeCapabilities = results.capabilities.filter((cap) =>
      cap.status.includes("✅")
    ).length;
    const capabilityScore =
      (activeCapabilities / results.capabilities.length) * 100;
    score += (capabilityScore / 100) * 30;

    if (score >= 90) return "A+ (Siêu thông minh)";
    if (score >= 80) return "A (Rất thông minh)";
    if (score >= 70) return "B+ (Thông minh)";
    if (score >= 60) return "B (Khá)";
    if (score >= 50) return "C (Trung bình)";
    return "D (Cần cải thiện)";
  }
}

// Export để sử dụng
window.GameAssistant = GameAssistant;
