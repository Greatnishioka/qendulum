<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    @viteReactRefresh
    @vite('resources/js/app.jsx')
    @inertiaHead
</head>
<body>
    <!-- ここでinertiaのコンポーネントが入る -->
    <!-- おもろい。つまりPHPでスロットを作っててその範囲内でReactを動作させてる -->
    @inertia
</body>
</html>
