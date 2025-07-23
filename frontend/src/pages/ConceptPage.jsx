import html2canvas from "html2canvas";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  BarChart3,
  WholeWordIcon,
  Brain,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Eye,
  Heart,
  MapPin,
  Monitor,
  Newspaper,
  Search,
  Server,
  Settings,
  Shield,
  Smile,
  Target,
  TrendingDown,
  TrendingUp,
  Twitter,
  Users,
  Zap,
} from "lucide-react";

const PoliticalSentimentInfographic = () => {
  const downloadImage = async () => {
    const element = document.getElementById("infographic-container");
    try {
      // Capture the infographic as a canvas
      await new Promise((resolve) => setTimeout(resolve, 500));
      const canvas = await html2canvas(element);

      // Convert the canvas to a PNG image
      const image = canvas.toDataURL("image/png");

      // Create a temporary link element to trigger the download
      const link = document.createElement("a");
      link.href = image;
      link.download = "PoliticalSentimentInfographic.png";

      // Trigger the download
      link.click();
    } catch (error) {
      console.error("Error capturing infographic:", error);
      alert("Failed to download the infographic. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div
        id="infographic-container"
        className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
        style={{ minHeight: "1000px" }}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 text-center">
          <h1 className="text-2xl font-bold">Political Sentiment Analysis</h1>
          <p className="text-md opacity-90">Concept Diagram</p>
        </div>

        {/* Problems Section */}
        {/* <div className="bg-gray-50 p-6 border-b-2 border-dashed border-gray-300">
          <div className="flex justify-between items-center mb-2">
           
            <h2 className="text-lg font-bold text-gray-800 flex-1 text-center">
              PROBLEMS
            </h2>
            <div className="w-8"></div>
          </div>

          <div className="grid grid-cols-6 gap-4">
            {[
              {
                icon: Clock,
                label: "Lack of\nReal-Time Insights",
                color: "bg-red-100 border-red-300",
              },
              {
                icon: AlertTriangle,
                label: "Bias and\nMisinformation",
                color: "bg-orange-100 border-orange-300",
              },
              {
                icon: Users,
                label: "Limited Voter\nUnderstanding",
                color: "bg-yellow-100 border-yellow-300",
              },
              {
                icon: Brain,
                label: "No Emotion\nAwareness",
                color: "bg-green-100 border-green-300",
              },
              {
                icon: TrendingDown,
                label: "Outdated\nPolling",
                color: "bg-blue-100 border-blue-300",
              },
              {
                icon: Database,
                label: "Data\nOverload",
                color: "bg-purple-100 border-purple-300",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`${item.color} border-2 rounded-lg p-3 text-center`}
              >
                <item.icon className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                <p className="text-sm font-medium text-gray-700 whitespace-pre-line">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div> */}

        {/* Main Diagram */}
        <div className="p-8 bg-white">
          {/* Data Sources Row */}
          <div className="mb-8">
            <h3 className="text-center text-lg font-bold text-gray-800 mb-6">
              DATA INPUT & COLLECTION
            </h3>
            <div className="flex justify-center items-center space-x-12">
              {/* Twitter Source */}
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <Twitter className="w-10 h-10 text-white" />
                </div>
                <p className="text-md font-semibold">X (Twitter)</p>
                <p className="text-sm text-gray-600">2022 Election Tweets</p>
              </div>

              {/* News Sources */}
              <div className="text-center">
                <div className="w-20 h-20 bg-green-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <Newspaper className="w-10 h-10 text-white" />
                </div>
                <p className="text-md font-semibold">News Sources</p>
                <p className="text-sm text-gray-600">Online Media</p>
              </div>

              {/* Preprocessing */}
              <div className="text-center">
                <div className="w-20 h-20 bg-orange-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <Settings className="w-10 h-10 text-white" />
                </div>
                <p className="text-md font-semibold">Preprocessing</p>
                <p className="text-sm text-gray-600">Cleaning & Tokenization</p>
              </div>

              {/* Feature Engineering */}
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <BarChart3 className="w-10 h-10 text-white" />
                </div>
                <p className="text-md font-semibold">Feature Engineering</p>
                <p className="text-sm text-gray-600">Word Frequency & EDA</p>
              </div>
            </div>

            {/* Down arrows */}
            <div className="flex justify-center mt-6">
              <ArrowDown className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          {/* System Architecture */}
          <div className="mb-8">
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
              <h3 className="text-center text-lg font-bold text-gray-800 mb-6">
                SYSTEM PIPELINE
              </h3>

              <div className="grid grid-cols-3 gap-8">
                {/* Frontend */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                    <Monitor className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-semibold text-md">Frontend</p>
                  <p className="text-sm text-gray-600">
                    React + Flask Dashboard
                  </p>
                </div>

                {/* Backend */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mb-3 mx-auto">
                    <Server className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-semibold text-md">Backend</p>
                  <p className="text-sm text-gray-600">
                    Python, Transformers, Gensim
                  </p>
                </div>

                {/* Infrastructure */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                    <Cpu className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-semibold text-md">Hardware</p>
                  <p className="text-sm text-gray-600">CPU + GPU + Storage</p>
                </div>
              </div>

              {/* AI Models */}
              <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="text-center font-bold text-md mb-4 text-gray-800">
                  MACHINE LEARNING MODELS USED
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg p-3">
                    <Brain className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-md font-semibold">
                      Fine-tuned RoBERTa-base
                    </p>
                    <p className="text-sm text-gray-600">
                      (Sentiment Analysis)
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-lg p-3">
                    <Smile className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <p className="text-md font-semibold">DistilBERT</p>
                    <p className="text-sm text-gray-600">(Emotion Detection)</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg p-3">
                    <Target className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <p className="text-md font-semibold">LDA</p>
                    <p className="text-sm text-gray-600">(Topic Modeling)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Down arrows */}
            <div className="flex justify-center mt-6">
              <ArrowDown className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          {/* Output Section */}
          <div className="mb-8">
            <h3 className="text-center text-lg font-bold text-gray-800 mb-6">
              OUTPUTS & RESULTS
            </h3>

            {/* Left side - Results */}
            <div className="grid grid-cols-2 gap-12">
              <div>
                <h4 className="font-bold text-md mb-4 text-center text-gray-700">
                  ANALYSIS RESULTS
                </h4>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
                    <Smile className="w-8 h-8 text-green-500 mr-3" />
                    <div>
                      <p className="font-semibold text-md">Sentiment Results</p>
                      <p className="text-sm text-gray-600">
                        Positive • Negative • Neutral • Context-Free
                      </p>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                    <Activity className="w-8 h-8 text-red-500 mr-3" />
                    <div>
                      <p className="font-semibold text-md">Emotion Graphs</p>
                      <p className="text-sm text-gray-600">
                        Joy • Anger • Fear • Sadness
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center">
                    <WholeWordIcon className="w-8 h-8 text-blue-500 mr-3" />
                    <div>
                      <p className="font-semibold text-md">
                        Political Trends by Key Topics
                      </p>
                      <p className="text-sm text-gray-600">
                       Topic Modeling Results
                      </p>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center">
                    <Search className="w-8 h-8 text-purple-500 mr-3" />
                    <div>
                      <p className="font-semibold text-md">Keyword Explorer</p>
                      <p className="text-sm text-gray-600">
                        Trending political topics
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Target Audience */}
              <div>
                <h4 className="font-bold text-md mb-4 text-center text-gray-700">
                  TARGET AUDIENCE
                </h4>
                <div className="space-y-4">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                    <Target className="w-12 h-12 mx-auto mb-2 text-indigo-600" />
                    <p className="font-semibold text-md">Political Analysts</p>
                    <p className="text-sm text-gray-600">
                      Data-driven insights
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <Newspaper className="w-12 h-12 mx-auto mb-2 text-green-600" />
                    <p className="font-semibold text-md">Journalists</p>
                    <p className="text-sm text-gray-600">Story development</p>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 text-orange-600" />
                    <p className="font-semibold text-md">
                      Election Strategists
                    </p>
                    <p className="text-sm text-gray-600">
                      Campaign optimization
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        {/* <div className="bg-green-50 p-6 border-t-2 border-dashed border-gray-300">
          <div className="flex justify-between items-center mb-2">
            
            <h2 className="text-lg font-bold text-gray-800 flex-1 text-center">
              BENEFITS
            </h2>
            <div className="w-8"></div>
          </div>

          <div className="grid grid-cols-6 gap-4">
            {[
              {
                icon: CheckCircle,
                label: "Improved\nAccuracy",
                color: "bg-green-100 border-green-300",
              },
              {
                icon: Shield,
                label: "Fair Political\nInsight",
                color: "bg-blue-100 border-blue-300",
              },
              {
                icon: Eye,
                label: "Public Sentiment\nVisibility",
                color: "bg-purple-100 border-purple-300",
              },
              {
                icon: Zap,
                label: "Data-Driven\nCampaigning",
                color: "bg-yellow-100 border-yellow-300",
              },
              {
                icon: Heart,
                label: "Unbiased Emotion\nMapping",
                color: "bg-red-100 border-red-300",
              },
              {
                icon: Settings,
                label: "Reusable Modular\nFramework",
                color: "bg-gray-100 border-gray-300",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`${item.color} border-2 rounded-lg p-3 text-center`}
              >
                <item.icon className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                <p className="text-sm font-medium text-gray-700 whitespace-pre-line">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div> */}
      </div>

      {/* Download Button */}
      <div className="text-center mt-6">
        <button
          onClick={downloadImage}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-colors"
        >
          Download Diagram
        </button>
      </div>
    </div>
  );
};

export default PoliticalSentimentInfographic;
