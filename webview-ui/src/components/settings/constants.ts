import {
	type ProviderName,
	type ModelInfo,
	anthropicModels,
	bedrockModels,
	cerebrasModels,
	claudeCodeModels,
	deepSeekModels,
	moonshotModels,
	// kilocode_change start
	// geminiModels,
	geminiCliModels,
	syntheticModels,
	// kilocode_change end
	mistralModels,
	openAiNativeModels,
	qwenCodeModels,
	vertexModels,
	xaiModels,
	groqModels,
	sambaNovaModels,
	doubaoModels,
	internationalZAiModels,
	fireworksModels,
	rooModels,
	featherlessModels,
	minimaxModels,
} from "@roo-code/types"

// 受限的模型列表，仅包含 DeepSeek、GLM、KIMI 三个模型
export const RESTRICTED_MODELS: Record<string, ModelInfo> = {
	"deepseek-chat": {
		maxTokens: 128000,
		contextWindow: 128000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.14,
		outputPrice: 0.28,
		description: "DeepSeek Chat - 高性能的对话模型",
	},
	"glm-4": {
		maxTokens: 128000,
		contextWindow: 128000,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0.1,
		outputPrice: 0.3,
		description: "GLM-4 - 智谱AI的多模态大模型",
	},
	kimi: {
		maxTokens: 200000,
		contextWindow: 200000,
		supportsImages: false,
		supportsPromptCache: true,
		inputPrice: 0.12,
		outputPrice: 0.12,
		description: "KIMI - 月之暗面的长文本模型",
	},
}

export const MODELS_BY_PROVIDER: Partial<Record<ProviderName, Record<string, ModelInfo>>> = {
	openai: RESTRICTED_MODELS,
}

export const PROVIDERS = [{ value: "openai", label: "OpenAI Compatible" }]
