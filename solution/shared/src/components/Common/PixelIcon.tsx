import React from "react";

// библиотека кастомных пиксельных иконок. всё в брутализме.
export const PixelIcon = {
  // корзина с зеленым акцентом
  Cart: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="2" y="3" width="4" height="2" fill="currentColor" />
      <rect x="6" y="5" width="2" height="2" fill="currentColor" />
      <rect x="8" y="5" width="12" height="2" fill="#00FA9A" />
      <rect x="8" y="7" width="12" height="2" fill="currentColor" />
      <rect x="8" y="9" width="10" height="2" fill="#00FA9A" />
      <rect x="8" y="11" width="10" height="2" fill="currentColor" />
      <rect x="8" y="13" width="8" height="2" fill="#7FFF00" />
      <rect x="8" y="15" width="8" height="2" fill="currentColor" />
      <rect x="8" y="19" width="4" height="2" fill="currentColor" />
      <rect x="14" y="19" width="4" height="2" fill="currentColor" />
      <rect x="9" y="20" width="2" height="2" fill="#00FA9A" />
      <rect x="15" y="20" width="2" height="2" fill="#00FA9A" />
    </svg>
  ),

  // лупа поиска с яркой линзой
  Search: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="6" y="2" width="8" height="2" fill="currentColor" />
      <rect x="4" y="4" width="2" height="2" fill="currentColor" />
      <rect x="14" y="4" width="2" height="2" fill="currentColor" />
      <rect x="2" y="6" width="2" height="6" fill="currentColor" />
      <rect x="16" y="6" width="2" height="6" fill="currentColor" />
      <rect x="4" y="6" width="12" height="6" fill="#7FFF00" opacity="0.3" />
      <rect x="6" y="6" width="4" height="2" fill="#7FFF00" opacity="0.6" />
      <rect x="4" y="12" width="2" height="2" fill="currentColor" />
      <rect x="14" y="12" width="2" height="2" fill="currentColor" />
      <rect x="6" y="14" width="8" height="2" fill="currentColor" />
      <rect x="14" y="14" width="2" height="2" fill="currentColor" />
      <rect x="16" y="16" width="2" height="2" fill="#2E8B57" />
      <rect x="18" y="18" width="2" height="2" fill="#2E8B57" />
      <rect x="20" y="20" width="2" height="2" fill="currentColor" />
    </svg>
  ),

  // фильтр с полосками
  Filter: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="2" y="4" width="20" height="2" fill="currentColor" />
      <rect x="2" y="4" width="6" height="2" fill="#7FFF00" />
      <rect x="4" y="8" width="16" height="2" fill="currentColor" />
      <rect x="4" y="8" width="4" height="2" fill="#00FA9A" />
      <rect x="6" y="12" width="12" height="2" fill="currentColor" />
      <rect x="6" y="12" width="4" height="2" fill="#2E8B57" />
      <rect x="8" y="16" width="8" height="2" fill="currentColor" />
      <rect x="10" y="20" width="4" height="2" fill="currentColor" />
      <rect x="10" y="20" width="2" height="2" fill="#7FFF00" />
    </svg>
  ),

  // обновление, всё по кругу
  Refresh: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="8" y="2" width="8" height="2" fill="#7FFF00" />
      <rect x="6" y="4" width="2" height="2" fill="currentColor" />
      <rect x="16" y="4" width="2" height="2" fill="currentColor" />
      <rect x="4" y="6" width="2" height="2" fill="currentColor" />
      <rect x="18" y="6" width="4" height="2" fill="#00FA9A" />
      <rect x="18" y="8" width="2" height="2" fill="currentColor" />
      <rect x="2" y="8" width="2" height="8" fill="currentColor" />
      <rect x="20" y="8" width="2" height="8" fill="currentColor" />
      <rect x="4" y="16" width="2" height="2" fill="currentColor" />
      <rect x="2" y="14" width="4" height="2" fill="#00FA9A" />
      <rect x="18" y="16" width="2" height="2" fill="currentColor" />
      <rect x="6" y="18" width="2" height="2" fill="currentColor" />
      <rect x="16" y="18" width="2" height="2" fill="currentColor" />
      <rect x="8" y="20" width="8" height="2" fill="#7FFF00" />
    </svg>
  ),

  // вход в личный кабинет
  Login: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="12" y="2" width="10" height="2" fill="currentColor" />
      <rect x="12" y="2" width="2" height="20" fill="currentColor" />
      <rect x="12" y="20" width="10" height="2" fill="currentColor" />
      <rect x="20" y="4" width="2" height="16" fill="currentColor" />
      <rect x="2" y="10" width="8" height="4" fill="#7FFF00" />
      <rect x="6" y="8" width="2" height="2" fill="#00FA9A" />
      <rect x="8" y="6" width="2" height="2" fill="#00FA9A" />
      <rect x="6" y="14" width="2" height="2" fill="#00FA9A" />
      <rect x="8" y="16" width="2" height="2" fill="#00FA9A" />
      <rect x="14" y="6" width="6" height="2" fill="#2E8B57" opacity="0.2" />
      <rect x="14" y="10" width="6" height="4" fill="#2E8B57" opacity="0.15" />
    </svg>
  ),

  // выход, красный — значит пора
  Logout: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="2" y="2" width="10" height="2" fill="currentColor" />
      <rect x="2" y="2" width="2" height="20" fill="currentColor" />
      <rect x="2" y="20" width="10" height="2" fill="currentColor" />
      <rect x="10" y="4" width="2" height="16" fill="currentColor" />
      <rect x="14" y="10" width="8" height="4" fill="#FF6B6B" />
      <rect x="18" y="8" width="2" height="2" fill="#FF4444" />
      <rect x="20" y="6" width="2" height="2" fill="#FF4444" />
      <rect x="18" y="14" width="2" height="2" fill="#FF4444" />
      <rect x="20" y="16" width="2" height="2" fill="#FF4444" />
      <rect x="4" y="6" width="4" height="2" fill="#2E8B57" opacity="0.2" />
      <rect x="4" y="10" width="4" height="4" fill="#2E8B57" opacity="0.15" />
    </svg>
  ),

  // профиль юзера
  User: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="8" y="2" width="8" height="2" fill="currentColor" />
      <rect x="6" y="4" width="2" height="2" fill="currentColor" />
      <rect x="16" y="4" width="2" height="2" fill="currentColor" />
      <rect x="6" y="4" width="12" height="6" fill="currentColor" />
      <rect x="8" y="4" width="2" height="2" fill="#7FFF00" />
      <rect x="14" y="4" width="2" height="2" fill="#7FFF00" />
      <rect x="10" y="8" width="4" height="2" fill="#00FA9A" />
      <rect x="8" y="10" width="8" height="2" fill="currentColor" />
      <rect x="10" y="12" width="4" height="2" fill="currentColor" />
      <rect x="4" y="14" width="16" height="2" fill="#7FFF00" />
      <rect x="2" y="16" width="20" height="2" fill="currentColor" />
      <rect x="2" y="18" width="20" height="4" fill="currentColor" />
      <rect x="4" y="18" width="16" height="2" fill="#2E8B57" opacity="0.3" />
    </svg>
  ),

  // новый юзер
  UserPlus: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="6" y="2" width="8" height="2" fill="currentColor" />
      <rect x="4" y="4" width="2" height="2" fill="currentColor" />
      <rect x="14" y="4" width="2" height="2" fill="currentColor" />
      <rect x="4" y="4" width="12" height="6" fill="currentColor" />
      <rect x="6" y="4" width="2" height="2" fill="#7FFF00" />
      <rect x="12" y="4" width="2" height="2" fill="#7FFF00" />
      <rect x="8" y="8" width="4" height="2" fill="#00FA9A" />
      <rect x="6" y="10" width="8" height="2" fill="currentColor" />
      <rect x="2" y="14" width="14" height="2" fill="#7FFF00" />
      <rect x="2" y="16" width="14" height="6" fill="currentColor" />
      <rect x="4" y="18" width="10" height="2" fill="#2E8B57" opacity="0.3" />
      <rect x="20" y="12" width="2" height="8" fill="#00FA9A" />
      <rect x="16" y="16" width="8" height="2" fill="#00FA9A" />
      <rect x="20" y="14" width="2" height="2" fill="#7FFF00" />
      <rect x="18" y="16" width="2" height="2" fill="#7FFF00" />
    </svg>
  ),

  // стрелки для навигации
  ArrowLeft: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="10" y="4" width="2" height="2" fill="#7FFF00" />
      <rect x="8" y="6" width="2" height="2" fill="#7FFF00" />
      <rect x="6" y="8" width="2" height="2" fill="#00FA9A" />
      <rect x="4" y="10" width="2" height="4" fill="#00FA9A" />
      <rect x="6" y="14" width="2" height="2" fill="#00FA9A" />
      <rect x="8" y="16" width="2" height="2" fill="#7FFF00" />
      <rect x="10" y="18" width="2" height="2" fill="#7FFF00" />
      <rect x="8" y="10" width="12" height="4" fill="currentColor" />
      <rect x="8" y="11" width="12" height="2" fill="#2E8B57" />
    </svg>
  ),

  ArrowRight: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="12" y="4" width="2" height="2" fill="#7FFF00" />
      <rect x="14" y="6" width="2" height="2" fill="#7FFF00" />
      <rect x="16" y="8" width="2" height="2" fill="#00FA9A" />
      <rect x="18" y="10" width="2" height="4" fill="#00FA9A" />
      <rect x="16" y="14" width="2" height="2" fill="#00FA9A" />
      <rect x="14" y="16" width="2" height="2" fill="#7FFF00" />
      <rect x="12" y="18" width="2" height="2" fill="#7FFF00" />
      <rect x="4" y="10" width="12" height="4" fill="currentColor" />
      <rect x="4" y="11" width="12" height="2" fill="#2E8B57" />
    </svg>
  ),

  // менюшка
  Menu: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="2" y="4" width="20" height="3" fill="currentColor" />
      <rect x="2" y="5" width="8" height="1" fill="#7FFF00" />
      <rect x="2" y="10" width="20" height="3" fill="currentColor" />
      <rect x="2" y="11" width="12" height="1" fill="#00FA9A" />
      <rect x="2" y="16" width="20" height="3" fill="currentColor" />
      <rect x="2" y="17" width="6" height="1" fill="#2E8B57" />
    </svg>
  ),

  // закрыть модалку
  Close: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="4" y="4" width="3" height="3" fill="#FF4444" />
      <rect x="7" y="7" width="3" height="3" fill="#FF6B6B" />
      <rect x="10" y="10" width="4" height="4" fill="currentColor" />
      <rect x="14" y="7" width="3" height="3" fill="#FF6B6B" />
      <rect x="17" y="4" width="3" height="3" fill="#FF4444" />
      <rect x="7" y="14" width="3" height="3" fill="#FF6B6B" />
      <rect x="4" y="17" width="3" height="3" fill="#FF4444" />
      <rect x="14" y="14" width="3" height="3" fill="#FF6B6B" />
      <rect x="17" y="17" width="3" height="3" fill="#FF4444" />
    </svg>
  ),

  // коробка/заказ
  Package: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="2" y="2" width="20" height="2" fill="currentColor" />
      <rect x="2" y="2" width="2" height="20" fill="currentColor" />
      <rect x="20" y="2" width="2" height="20" fill="currentColor" />
      <rect x="2" y="20" width="20" height="2" fill="currentColor" />
      <rect x="4" y="4" width="16" height="4" fill="#7FFF00" />
      <rect x="10" y="4" width="4" height="4" fill="#2E8B57" />
      <rect x="10" y="8" width="4" height="12" fill="#2E8B57" opacity="0.4" />
      <rect x="4" y="8" width="6" height="12" fill="#00FA9A" opacity="0.15" />
      <rect x="14" y="8" width="6" height="12" fill="#00FA9A" opacity="0.15" />
      <rect x="8" y="12" width="8" height="2" fill="#7FFF00" opacity="0.5" />
    </svg>
  ),

  // звезда
  Star: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="10" y="2" width="4" height="4" fill="#FFD700" />
      <rect x="8" y="6" width="8" height="2" fill="#FFB800" />
      <rect x="2" y="8" width="20" height="2" fill="#FFA500" />
      <rect x="4" y="10" width="16" height="2" fill="#FFD700" />
      <rect x="6" y="12" width="12" height="2" fill="#FFB800" />
      <rect x="6" y="14" width="4" height="2" fill="#FFA500" />
      <rect x="14" y="14" width="4" height="2" fill="#FFA500" />
      <rect x="4" y="16" width="4" height="2" fill="#FFD700" />
      <rect x="16" y="16" width="4" height="2" fill="#FFD700" />
      <rect x="2" y="18" width="4" height="2" fill="#FFB800" />
      <rect x="18" y="18" width="4" height="2" fill="#FFB800" />
    </svg>
  ),

  // защита
  Shield: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="4" y="2" width="16" height="2" fill="currentColor" />
      <rect x="2" y="4" width="2" height="10" fill="currentColor" />
      <rect x="20" y="4" width="2" height="10" fill="currentColor" />
      <rect x="4" y="4" width="16" height="10" fill="#7FFF00" opacity="0.25" />
      <rect x="4" y="14" width="2" height="2" fill="currentColor" />
      <rect x="18" y="14" width="2" height="2" fill="currentColor" />
      <rect x="6" y="16" width="2" height="2" fill="currentColor" />
      <rect x="16" y="16" width="2" height="2" fill="currentColor" />
      <rect x="8" y="18" width="2" height="2" fill="currentColor" />
      <rect x="14" y="18" width="2" height="2" fill="currentColor" />
      <rect x="10" y="20" width="4" height="2" fill="currentColor" />
      <rect x="8" y="7" width="2" height="6" fill="#00FA9A" />
      <rect x="10" y="11" width="2" height="2" fill="#00FA9A" />
      <rect x="12" y="9" width="2" height="2" fill="#00FA9A" />
      <rect x="14" y="7" width="2" height="2" fill="#00FA9A" />
    </svg>
  ),

  // время
  Clock: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="8" y="2" width="8" height="2" fill="currentColor" />
      <rect x="6" y="4" width="2" height="2" fill="currentColor" />
      <rect x="16" y="4" width="2" height="2" fill="currentColor" />
      <rect x="4" y="6" width="2" height="2" fill="currentColor" />
      <rect x="18" y="6" width="2" height="2" fill="currentColor" />
      <rect x="2" y="8" width="2" height="2" fill="currentColor" />
      <rect x="20" y="8" width="2" height="8" fill="currentColor" />
      <rect x="4" y="8" width="16" height="8" fill="#7FFF00" opacity="0.1" />
      <rect x="4" y="16" width="2" height="2" fill="currentColor" />
      <rect x="18" y="16" width="2" height="2" fill="currentColor" />
      <rect x="6" y="18" width="2" height="2" fill="currentColor" />
      <rect x="16" y="18" width="2" height="2" fill="currentColor" />
      <rect x="8" y="20" width="8" height="2" fill="currentColor" />
      <rect x="10" y="6" width="4" height="2" fill="#00FA9A" />
      <rect x="10" y="8" width="2" height="4" fill="#2E8B57" />
      <rect x="12" y="10" width="4" height="2" fill="#7FFF00" />
      <rect x="11" y="11" width="2" height="2" fill="currentColor" />
    </svg>
  ),

  // теги/метки
  Tag: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="2" y="2" width="12" height="2" fill="currentColor" />
      <rect x="2" y="2" width="2" height="12" fill="currentColor" />
      <rect x="4" y="4" width="8" height="8" fill="#7FFF00" opacity="0.3" />
      <rect x="6" y="6" width="4" height="4" fill="#00FA9A" />
      <rect x="7" y="7" width="2" height="2" fill="currentColor" />
      <rect x="14" y="4" width="2" height="2" fill="currentColor" />
      <rect x="16" y="6" width="2" height="2" fill="#2E8B57" />
      <rect x="18" y="8" width="2" height="2" fill="#2E8B57" />
      <rect x="20" y="10" width="2" height="2" fill="currentColor" />
      <rect x="20" y="12" width="2" height="2" fill="currentColor" />
      <rect x="18" y="14" width="2" height="2" fill="#2E8B57" />
      <rect x="16" y="16" width="2" height="2" fill="#2E8B57" />
      <rect x="14" y="18" width="2" height="2" fill="currentColor" />
      <rect x="4" y="14" width="2" height="2" fill="currentColor" />
      <rect x="6" y="16" width="2" height="2" fill="#2E8B57" />
      <rect x="8" y="18" width="2" height="2" fill="#2E8B57" />
      <rect x="10" y="20" width="4" height="2" fill="currentColor" />
    </svg>
  ),

  // новая жирная и заметная галочка. теперь её точно не пропустишь.
  Check: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* основной контур */}
      <rect x="18" y="4" width="4" height="4" fill="currentColor" />
      <rect x="16" y="6" width="4" height="4" fill="currentColor" />
      <rect x="14" y="8" width="4" height="4" fill="currentColor" />
      <rect x="12" y="10" width="4" height="4" fill="currentColor" />
      <rect x="10" y="12" width="4" height="4" fill="currentColor" />
      <rect x="8" y="14" width="4" height="4" fill="currentColor" />
      <rect x="6" y="12" width="4" height="4" fill="currentColor" />
      <rect x="4" y="10" width="4" height="4" fill="currentColor" />
      <rect x="2" y="8" width="4" height="4" fill="currentColor" />
      
      {/* яркие акценты */}
      <rect x="18" y="6" width="2" height="2" fill="#00FA9A" />
      <rect x="10" y="14" width="2" height="2" fill="#7FFF00" />
      <rect x="4" y="10" width="2" height="2" fill="#00FA9A" />
    </svg>
  ),

  // импорт данных
  Import: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="4" y="2" width="16" height="2" fill="currentColor" />
      <rect x="4" y="20" width="16" height="2" fill="currentColor" />
      <rect x="11" y="6" width="2" height="10" fill="#00FA9A" />
      <rect x="7" y="12" width="2" height="2" fill="currentColor" />
      <rect x="9" y="14" width="2" height="2" fill="currentColor" />
      <rect x="13" y="14" width="2" height="2" fill="currentColor" />
      <rect x="15" y="12" width="2" height="2" fill="currentColor" />
      <rect x="11" y="16" width="2" height="2" fill="#7FFF00" />
    </svg>
  ),
  
  // иконка плюсика для добавления чего-либо
  Plus: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="10" y="4" width="4" height="16" fill="currentColor" />
      <rect x="4" y="10" width="16" height="4" fill="currentColor" />
      <rect x="11" y="5" width="2" height="14" fill="#00FA9A" />
      <rect x="5" y="11" width="14" height="2" fill="#7FFF00" />
    </svg>
  ),

  // карандаш для редактирования
  Edit: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="14" y="2" width="8" height="8" fill="currentColor" />
      <rect x="16" y="4" width="4" height="4" fill="#7FFF00" />
      <rect x="4" y="12" width="10" height="10" fill="currentColor" />
      <rect x="6" y="14" width="6" height="6" fill="#00FA9A" />
      <rect x="2" y="20" width="2" height="2" fill="currentColor" />
    </svg>
  ),

  // мусорка для удаления
  Trash: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="4" y="2" width="16" height="2" fill="currentColor" />
      <rect x="6" y="4" width="12" height="2" fill="currentColor" />
      <rect x="8" y="6" width="8" height="16" fill="currentColor" />
      <rect x="10" y="8" width="2" height="12" fill="#FF4444" />
      <rect x="14" y="8" width="2" height="12" fill="#FF4444" />
      <rect x="2" y="4" width="20" height="2" fill="currentColor" />
    </svg>
  ),
};
