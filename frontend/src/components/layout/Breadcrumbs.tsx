import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils/helpers';

interface BreadcrumbItem {
  name: string;
  href?: string;
  current?: boolean;
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Dashboard', href: '/dashboard' }
    ];

    if (pathSegments.length === 0 || pathSegments[0] === 'dashboard') {
      breadcrumbs[0].current = true;
      return breadcrumbs;
    }

    // Generate breadcrumbs based on path
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Convert segment to readable name
      const name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({
        name,
        href: isLast ? undefined : currentPath,
        current: isLast,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.name}>
            <div className="flex items-center">
              {index > 0 && (
                <svg
                  className="flex-shrink-0 h-4 w-4 text-gray-300 dark:text-gray-600 mr-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
              )}

              {breadcrumb.current ? (
                <span
                  className="ml-4 text-sm font-medium text-gray-500 dark:text-gray-400"
                  aria-current="page"
                >
                  {breadcrumb.name}
                </span>
              ) : breadcrumb.href ? (
                <Link
                  to={breadcrumb.href}
                  className={cn(
                    'text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors',
                    index === 0 ? '' : 'ml-4'
                  )}
                >
                  {breadcrumb.name}
                </Link>
              ) : (
                <span className="ml-4 text-sm font-medium text-gray-900 dark:text-white">
                  {breadcrumb.name}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;