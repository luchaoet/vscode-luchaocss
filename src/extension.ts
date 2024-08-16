import { ExtensionContext, workspace, window, languages, CompletionItem, CompletionItemKind } from 'vscode';
import { join } from 'path';
import { CONFIG_GLOB, IGNORE } from './lib/constants';
import * as os from 'node:os';

const activate = async function (context: ExtensionContext) {
	const rootPath = workspace.workspaceFolders?.[0]?.uri.path || '';
	const config = { prefix: 'g', theme: {} };
	try {
		const module = require(join(rootPath, './node_modules/luchaocss/loadConfig.js'));
		const loadConfig = module.loadConfig;
		const normalizePath = module.normalizePath;
		const glob = module.glob;

		let files = await glob([`**/${CONFIG_GLOB}`], {
			cwd: rootPath,
			ignore: IGNORE,
			onlyFiles: true,
			absolute: true,
			suppressErrors: true,
			dot: true,
			concurrency: Math.max(os.cpus().length, 1),
		});
		files = files.map((file: string) => normalizePath(file));
		const c = loadConfig(files?.[0]);

		const luchaoxssConfig = c?.plugins?.find((i: any) => i.postcssPlugin === 'luchaocss')?.config;
		if (luchaoxssConfig?.prefix) {
			config.prefix = luchaoxssConfig.prefix;
		}
		if (luchaoxssConfig?.theme) {
			config.theme = luchaoxssConfig.theme;
		}
	} catch (error) {
		window.showWarningMessage(`npm install luchaocss --save`);
	}

	const { prefix, theme } = config as any;

	const provider = languages.registerCompletionItemProvider(
		['html', 'vue', 'react', 'javascript', 'javascriptreact', 'typescriptreact'],
		{
			async provideCompletionItems(document: any, position: any) {
				const text = document.lineAt(position).text;
				const linePrefix = text.slice(0, position.character);

				if (!linePrefix.match(/class(Name)?\s*=\s*["'][^"']*$/)) {
					return undefined;
				}

				const classVariants = [
					{ label: `${prefix}-m-`, description: 'margin' },
					{ label: `${prefix}-mt-`, description: 'margin-top' },
					{ label: `${prefix}-mb-`, description: 'margin-bottom' },
					{ label: `${prefix}-ml-`, description: 'margin-left' },
					{ label: `${prefix}-mr-`, description: 'margin-right' },
					{ label: `${prefix}-mtb-`, description: 'margin-top / margin-bottom' },
					{ label: `${prefix}-mlr-`, description: 'margin-left / margin-right' },
					{ label: `${prefix}-p-`, description: 'padding' },
					{ label: `${prefix}-pt-`, description: 'padding-top' },
					{ label: `${prefix}-pb-`, description: 'padding-bottom' },
					{ label: `${prefix}-pl-`, description: 'padding-left' },
					{ label: `${prefix}-pr-`, description: 'padding-right' },
					{ label: `${prefix}-ptb-`, description: 'padding-top / padding-bottom' },
					{ label: `${prefix}-plr-`, description: 'padding-left / padding-right' },
					{ label: `${prefix}-fs-`, description: 'font-size' },
					{ label: `${prefix}-fw-`, description: 'font-weight' },
					{ label: `${prefix}-h:${prefix}-`, description: 'hover:' },
					{ label: `${prefix}-bg-`, description: 'background-color' },
					{ label: `${prefix}-bc-`, description: 'border-color' },
					{ label: `${prefix}-d-`, description: 'display' },
					{ label: `${prefix}-h-`, description: 'height' },
					{ label: `${prefix}-w-`, description: 'width' },
					{ label: `${prefix}-zi-`, description: 'z-index' },
					{ label: `${prefix}-lh-`, description: 'line-height' },
					{ label: `${prefix}-bw-`, description: 'border-width' },
					{ label: `${prefix}-br-`, description: 'border-radius' },
					{ label: `${prefix}-bs-`, description: 'border-style / border-shadow' },
					{ label: `${prefix}-of-`, description: 'object-fit' },
					{ label: `${prefix}-c-`, description: 'color / cursor' },
					{ label: `${prefix}-e-`, description: '1行省略 / 2行省略' },
					{ label: `${prefix}-gg-`, description: 'grid-gap' },
					{ label: `${prefix}-grg-`, description: 'grid-row-gap' },
					{ label: `${prefix}-gcg-`, description: 'grid-column-gap' },
					{ label: `${prefix}-ai-`, description: 'align-items' },
					{ label: `${prefix}-jc-`, description: 'justify-content' },
					{ label: `${prefix}-fd-`, description: 'flex-direction' },
					{ label: `${prefix}-fg-`, description: 'flex-grow' },
					{ label: `${prefix}-t-`, description: 'top' },
					{ label: `${prefix}-b-`, description: 'bottom' },
					{ label: `${prefix}-r-`, description: 'right' },
					{ label: `${prefix}-l-`, description: 'left' },
					{ label: `${prefix}-o-`, description: 'opacity / overflow / order' },
					{ label: `${prefix}-ox-`, description: 'overflow-x' },
					{ label: `${prefix}-oy-`, description: 'overflow-y' },
					{ label: `${prefix}-ta-`, description: 'text-align' },

				];

				Object.keys(theme || {}).forEach(label => {
					const values = theme[label];
					const keyvalue = Object.keys(values).map(key => `${key}: ${values[key]}`);
					classVariants.push({
						label,
						description: keyvalue.join(';')
					});
				});

				return classVariants.map(a => {
					const item = new CompletionItem({
						label: a.label,
						description: a.description,
					}, CompletionItemKind.Text);
					return item;
				});
			}
		},
		`${prefix}-`
	);
	context.subscriptions.push(provider);
};

// This method is called when your extension is deactivated
const deactivate = function () { };

export {
	deactivate,
	activate,
};
