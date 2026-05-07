/**
 * @file src/sites/useBrandTheme.js
 *
 * URL に応じて document.body のクラスを切り替えるフック。
 * - /pet 配下: body.theme-pawspress（PAWS PRESS テーマ）
 * - それ以外:   body.theme-kataribin（かたち便テーマ）
 *
 * CSS 変数の切替は src/index.css の `:root, body.theme-kataribin` /
 * `body.theme-pawspress` ブロックで定義されている。詳細は同ファイル参照。
 *
 * 使用上の注意:
 *   - useLocation を内部で呼ぶため、必ず BrowserRouter の内側で呼ぶこと
 *   - 戻り値の `brand` は必要に応じてコンポーネント側で参照可（任意）
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useBrandTheme = () => {
    const { pathname } = useLocation();
    const isPawsPress = pathname.startsWith('/pet');

    useEffect(() => {
        document.body.classList.toggle('theme-pawspress', isPawsPress);
        document.body.classList.toggle('theme-kataribin', !isPawsPress);
    }, [isPawsPress]);

    return { brand: isPawsPress ? 'pawspress' : 'kataribin' };
};
