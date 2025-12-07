import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { OpenAICompatible } from "../OpenAICompatible"
import { ProviderSettings } from "@roo-code/types"

// 模拟依赖
jest.mock("@src/i18n/TranslationContext", () => ({
	useAppTranslation: () => ({
		t: (key: string) => {
			const translations: Record<string, string> = {
				"settings:providers.openAiBaseUrl": "Base URL",
				"settings:providers.baseUrlAutoSet": "Base URL is automatically set based on the selected model",
				"settings:providers.umNumber": "UM Account",
				"settings:providers.apiKey": "API Key",
				"settings:providers.customHeaders": "Custom Headers",
				"settings:common.add": "Add",
				"settings:common.remove": "Remove",
				"settings:providers.noCustomHeaders": "No custom headers",
				"settings:providers.headerName": "Header Name",
				"settings:providers.headerValue": "Header Value",
				"settings:placeholders.apiKey": "Enter API key",
			}
			return translations[key] || key
		},
	}),
}))

describe("OpenAICompatible UM Number Functionality", () => {
	const mockSetApiConfigurationField = jest.fn()
	const mockOrganizationAllowList = {
		allowAll: true,
		providers: {},
	}

	const defaultProps = {
		apiConfiguration: {
			openAiBaseUrl: "",
			openAiApiKey: "",
			openAiModelId: "deepseek-chat",
			umNumber: "",
			openAiHeaders: {},
		} as ProviderSettings,
		setApiConfigurationField: mockSetApiConfigurationField,
		organizationAllowList: mockOrganizationAllowList,
	}

	beforeEach(() => {
		jest.clearAllMocks()
	})

	test("应该根据选择的模型自动设置基础URL", async () => {
		const { rerender } = render(<OpenAICompatible {...defaultProps} />)

		// 模拟选择 deepseek-chat 模型
		const newConfig = {
			...defaultProps.apiConfiguration,
			openAiModelId: "deepseek-chat",
		}

		rerender(<OpenAICompatible {...defaultProps} apiConfiguration={newConfig} />)

		await waitFor(() => {
			expect(mockSetApiConfigurationField).toHaveBeenCalledWith(
				"openAiBaseUrl",
				"http://127.0.0.1:8080/test/model/deepseek-chat/v1",
			)
		})
	})

	test("应该根据选择的模型自动设置正确的基础URL - glm-4", async () => {
		const { rerender } = render(<OpenAICompatible {...defaultProps} />)

		// 模拟选择 glm-4 模型
		const newConfig = {
			...defaultProps.apiConfiguration,
			openAiModelId: "glm-4",
		}

		rerender(<OpenAICompatible {...defaultProps} apiConfiguration={newConfig} />)

		await waitFor(() => {
			expect(mockSetApiConfigurationField).toHaveBeenCalledWith(
				"openAiBaseUrl",
				"http://127.0.0.1:8080/test/model/glm-4/v1",
			)
		})
	})

	test("应该根据选择的模型自动设置正确的基础URL - kimi", async () => {
		const { rerender } = render(<OpenAICompatible {...defaultProps} />)

		// 模拟选择 kimi 模型
		const newConfig = {
			...defaultProps.apiConfiguration,
			openAiModelId: "kimi",
		}

		rerender(<OpenAICompatible {...defaultProps} apiConfiguration={newConfig} />)

		await waitFor(() => {
			expect(mockSetApiConfigurationField).toHaveBeenCalledWith(
				"openAiBaseUrl",
				"http://127.0.0.1:8080/test/model/kimi/v1",
			)
		})
	})

	test("应该在输入UM号时更新请求头", async () => {
		const { rerender } = render(<OpenAICompatible {...defaultProps} />)

		// 模拟输入UM号
		const newConfig = {
			...defaultProps.apiConfiguration,
			umNumber: "UM123456",
		}

		rerender(<OpenAICompatible {...defaultProps} apiConfiguration={newConfig} />)

		await waitFor(() => {
			expect(mockSetApiConfigurationField).toHaveBeenCalledWith("openAiHeaders", {
				"UM-Number": "UM123456",
			})
		})
	})

	test("应该在UM号变更时保留现有请求头并添加UM号", async () => {
		const initialConfig = {
			...defaultProps.apiConfiguration,
			openAiHeaders: {
				"Content-Type": "application/json",
				Authorization: "Bearer token123",
			},
		}

		const { rerender } = render(<OpenAICompatible {...defaultProps} apiConfiguration={initialConfig} />)

		// 模拟输入UM号
		const newConfig = {
			...initialConfig,
			umNumber: "UM789012",
		}

		rerender(<OpenAICompatible {...defaultProps} apiConfiguration={newConfig} />)

		await waitFor(() => {
			expect(mockSetApiConfigurationField).toHaveBeenCalledWith("openAiHeaders", {
				"Content-Type": "application/json",
				Authorization: "Bearer token123",
				"UM-Number": "UM789012",
			})
		})
	})

	test("基础URL字段应该是只读的", () => {
		render(<OpenAICompatible {...defaultProps} />)

		const baseUrlInput = screen.getByLabelText("Base URL")
		expect(baseUrlInput).toHaveAttribute("readonly")
	})

	test("应该显示基础URL自动设置的提示文本", () => {
		render(<OpenAICompatible {...defaultProps} />)

		expect(screen.getByText("Base URL is automatically set based on the selected model")).toBeInTheDocument()
	})

	test("应该显示UM账号输入字段", () => {
		render(<OpenAICompatible {...defaultProps} />)

		const umNumberInput = screen.getByLabelText("UM Account")
		expect(umNumberInput).toBeInTheDocument()
		expect(umNumberInput).toHaveAttribute("placeholder", "UM Account")
	})
})

// 集成测试用例 - 模拟实际API调用
describe("OpenAICompatible Integration Tests", () => {
	const mockSetApiConfigurationField = jest.fn()
	const mockOrganizationAllowList = {
		allowAll: true,
		providers: {},
	}

	const testScenarios = [
		{
			model: "deepseek-chat",
			umNumber: "UM001",
			expectedUrl: "http://127.0.0.1:8080/test/model/deepseek-chat/v1",
			description: "DeepSeek模型与UM号",
		},
		{
			model: "glm-4",
			umNumber: "UM002",
			expectedUrl: "http://127.0.0.1:8080/test/model/glm-4/v1",
			description: "GLM-4模型与UM号",
		},
		{
			model: "kimi",
			umNumber: "UM003",
			expectedUrl: "http://127.0.0.1:8080/test/model/kimi/v1",
			description: "Kimi模型与UM号",
		},
	]

	test.each(testScenarios)("$description", async ({ model, umNumber, expectedUrl }) => {
		const config = {
			openAiBaseUrl: "",
			openAiApiKey: "test-api-key",
			openAiModelId: model,
			umNumber: umNumber,
			openAiHeaders: {},
		} as ProviderSettings

		const { rerender: _rerender } = render(
			<OpenAICompatible
				apiConfiguration={config}
				setApiConfigurationField={mockSetApiConfigurationField}
				organizationAllowList={mockOrganizationAllowList}
			/>,
		)

		// 验证基础URL设置
		await waitFor(() => {
			expect(mockSetApiConfigurationField).toHaveBeenCalledWith("openAiBaseUrl", expectedUrl)
		})

		// 验证UM号请求头设置
		await waitFor(() => {
			expect(mockSetApiConfigurationField).toHaveBeenCalledWith("openAiHeaders", {
				"UM-Number": umNumber,
			})
		})
	})
})

// 边界条件测试
describe("OpenAICompatible Edge Cases", () => {
	const mockSetApiConfigurationField = jest.fn()
	const mockOrganizationAllowList = {
		allowAll: true,
		providers: {},
	}

	beforeEach(() => {
		jest.clearAllMocks()
	})

	test("应该处理空的UM号", async () => {
		const config = {
			openAiBaseUrl: "http://127.0.0.1:8080/test/model/deepseek-chat/v1",
			openAiApiKey: "test-api-key",
			openAiModelId: "deepseek-chat",
			umNumber: "",
			openAiHeaders: {
				"Content-Type": "application/json",
			},
		} as ProviderSettings

		const { rerender: _rerender } = render(
			<OpenAICompatible
				apiConfiguration={config}
				setApiConfigurationField={mockSetApiConfigurationField}
				organizationAllowList={mockOrganizationAllowList}
			/>,
		)

		// 空UM号不应该触发请求头更新
		await waitFor(() => {
			expect(mockSetApiConfigurationField).not.toHaveBeenCalledWith("openAiHeaders", expect.anything())
		})
	})

	test("应该处理未授权的模型", async () => {
		const config = {
			openAiBaseUrl: "",
			openAiApiKey: "test-api-key",
			openAiModelId: "unauthorized-model",
			umNumber: "UM123",
			openAiHeaders: {},
		} as ProviderSettings

		render(
			<OpenAICompatible
				apiConfiguration={config}
				setApiConfigurationField={mockSetApiConfigurationField}
				organizationAllowList={mockOrganizationAllowList}
			/>,
		)

		// 未授权的模型不应该设置基础URL
		await waitFor(() => {
			expect(mockSetApiConfigurationField).not.toHaveBeenCalledWith("openAiBaseUrl", expect.anything())
		})
	})
})
